import streamlit as st
import os
import tempfile
from pathlib import Path
from PIL import Image
import torch
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

from config import CHECKPOINT_DIR
from src.evaluation.inference import load_model, preprocess_wafer_array, load_wafer_image

# Cache the model to prevent loading it multiple times
@st.cache_resource(show_spinner="🧠 Loading EfficientNet-B2 model from checkpoint...")
def get_cached_model(checkpoint_path: Path):
    if not checkpoint_path.is_file():
        raise FileNotFoundError(
            f"Checkpoint file not found at: `{checkpoint_path}`.\n"
            "Please ensure training has completed and saved a checkpoint."
        )
    return load_model(checkpoint_path)

def draw_top_k_chart(predictions):
    """Draws a clean, professional horizontal bar chart for top predictions."""
    # Sort in ascending order of probability for standard horizontal plotting
    sorted_preds = sorted(predictions, key=lambda x: x[1])
    classes = [p[0] for p in sorted_preds]
    probs = [p[1] * 100 for p in sorted_preds]
    
    # Set facecolor to none for transparent rendering
    fig, ax = plt.subplots(figsize=(6, 3), facecolor='none')
    ax.set_facecolor('none')
    
    # Nvidia green color scheme
    bars = ax.barh(classes, probs, color="#76B900", edgecolor="none", height=0.6)
    
    # Customizing spines and axes styles
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['bottom'].set_visible(False)
    ax.spines['left'].set_color('#444444')
    ax.xaxis.grid(True, linestyle='--', alpha=0.15, color='#ffffff')
    ax.set_axisbelow(True)
    
    ax.set_xlabel("Probability (%)", fontsize=10, fontweight='bold', color='#aaaaaa')
    ax.set_xlim(0, 115)
    ax.tick_params(colors='#cccccc', which='both')
    
    # Add values on the end of the bars
    for bar in bars:
        width = bar.get_width()
        ax.text(
            width + 2,
            bar.get_y() + bar.get_height() / 2,
            f"{width:.1f}%",
            ha='left',
            va='center',
            fontsize=9,
            fontweight='bold',
            color='#ffffff'
          )
          
    plt.tight_layout()
    return fig

def show():
    st.title("🔍 Wafer Defect Predictor")
    st.markdown(
        """
        Upload a single wafer map image (PNG, JPG, or JPEG) to run real-time inference using 
        the trained **EfficientNet-B2** model.
        """
    )
    
    st.divider()

    # Initialize prediction history session state
    if "prediction_history" not in st.session_state:
        st.session_state.prediction_history = []

    # Define model checkpoint path
    checkpoint_path = CHECKPOINT_DIR / "efficientnet_b2_wm811k" / "best.pt"
    
    # Load model and handle errors
    model = None
    class_to_index = None
    device = None
    
    try:
        model, class_to_index, device = get_cached_model(checkpoint_path)
        st.info(f"ℹ️ Hardware Status: Model initialized on **{device.type.upper()}** device.")
    except Exception as e:
        st.error("🚨 **Failed to load the model checkpoint**")
        st.markdown(f"**Error Details:** {e}")
        st.info("💡 Please verify that the file exists and is a valid PyTorch model weights file.")
        
        # Render placeholders for disabled UI
        st.divider()
        col_in, col_out = st.columns(2)
        with col_in:
            st.subheader("📥 Upload Wafer Map")
            st.file_uploader("Select an image file...", type=["png", "jpg", "jpeg"], disabled=True)
            st.button("🚀 Run Predictor", disabled=True)
        with col_out:
            st.subheader("🖥️ Inference Results & Preview")
            st.info("🖼️ Upload an image to view preview.")
            st.markdown("#### Model Outputs")
            c1, c2 = st.columns(2)
            c1.metric("Predicted Defect Class", "N/A")
            c2.metric("Confidence Score", "N/A")
        return

    col_input, col_output = st.columns(2)
    uploaded_file = None
    
    with col_input:
        st.subheader("📥 Upload Wafer Map")
        uploaded_file = st.file_uploader(
            "Select an image file...",
            type=["png", "jpg", "jpeg"],
            help="Supported formats: PNG, JPG, JPEG."
        )
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Predict Button
        predict_clicked = st.button(
            "🚀 Run Predictor",
            use_container_width=True,
            disabled=uploaded_file is None,
            help="Upload an image first to run model prediction."
        )
        
        if uploaded_file is None:
            st.info("💡 Please upload a wafer map image to enable prediction.")
            
    with col_output:
        st.subheader("🖥️ Inference Results & Preview")
        
        preview_placeholder = st.empty()
        result_placeholder = st.empty()
        
        # Image Preview
        if uploaded_file is not None:
            try:
                img = Image.open(uploaded_file)
                # Bordered card for preview
                with preview_placeholder.container(border=True):
                    st.image(
                        img, 
                        caption=f"Uploaded Wafer Map: {uploaded_file.name}", 
                        use_container_width=True
                    )
            except Exception as e:
                preview_placeholder.error(f"Error rendering image preview: {e}")
        else:
            preview_placeholder.info("🖼️ No image uploaded yet. A preview will be displayed here.")
            
        # Prediction Output placeholder (displayed initially before prediction)
        with result_placeholder.container():
            st.markdown("#### Model Outputs")
            res_col1, res_col2 = st.columns(2)
            res_col1.metric("Predicted Defect Class", "Pending", help="Predicted wafer pattern classification.")
            res_col2.metric("Confidence Score", "--%", help="Confidence of the prediction.")
            
        # If Predict button is clicked
        if predict_clicked and uploaded_file is not None:
            suffix = Path(uploaded_file.name).suffix
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
                temp_file.write(uploaded_file.getvalue())
                temp_path = Path(temp_file.name)
                
            try:
                with st.spinner("⏳ Preprocessing image & running inference..."):
                    # 1. Load the image exactly as training does
                    image_np = load_wafer_image(temp_path)
                    
                    # 2. Preprocess wafer array to target image size & normalise
                    tensor = preprocess_wafer_array(image_np).to(device)
                    
                    # 3. Model Inference
                    with torch.no_grad():
                        logits = model(tensor)
                        probabilities = torch.softmax(logits, dim=1)[0]
                    
                    # 4. Extract Top-3 predictions
                    top_k = min(3, len(class_to_index))
                    top_probs, top_indices = torch.topk(probabilities, k=top_k)
                    
                    index_to_class = {index: name for name, index in class_to_index.items()}
                    top_predictions = [
                        (index_to_class[idx.item()], float(prob.item()))
                        for prob, idx in zip(top_probs, top_indices)
                    ]
                    
                    best_class, best_conf = top_predictions[0]
                    
                # Append to history session state
                st.session_state.prediction_history.append({
                    "Time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Predicted Class": best_class,
                    "Confidence": f"{best_conf * 100:.2f}%"
                })
                
                # Update result placeholder with actual outputs
                with result_placeholder.container():
                    st.markdown("#### Model Outputs")
                    
                    # Highlight predicted class in a green success card
                    st.success(
                        f"🎉 **Predictive Classification Complete!**  \n"
                        f"Detected Defect Signature: **{best_class}**  \n"
                        f"Probability Confidence: **{best_conf * 100:.2f}%**"
                    )
                    
                    res_col1, res_col2 = st.columns(2)
                    res_col1.metric("Predicted Defect Class", best_class)
                    res_col2.metric("Confidence Score", f"{best_conf * 100:.2f}%")
                    
                    st.markdown("##### 📊 Top-3 Class Probability Distribution")
                    # Display horizontal bar chart
                    chart_fig = draw_top_k_chart(top_predictions)
                    st.pyplot(chart_fig)
                    plt.close(chart_fig)
                        
            except Exception as e:
                # Red error status card on failure
                st.error("❌ **Prediction Failure**")
                st.markdown(f"An error occurred during inference: `{e}`")
            finally:
                # Cleanup temporary file
                if temp_path.exists():
                    os.remove(temp_path)

    # Full width Prediction History section at bottom
    st.divider()
    st.subheader("📋 Session Prediction History")
    
    if st.session_state.prediction_history:
        # Show newest predictions first
        history_df = pd.DataFrame(st.session_state.prediction_history[::-1])
        
        hist_col1, hist_col2 = st.columns([4, 1])
        with hist_col1:
            st.dataframe(history_df, use_container_width=True, hide_index=True)
        with hist_col2:
            st.write("") # alignment spacing
            if st.button("🗑️ Clear History", use_container_width=True):
                st.session_state.prediction_history = []
                st.rerun()
    else:
        st.info("💡 No predictions have been recorded in this session yet.")
