import streamlit as st

def show():
    st.title("ℹ️ About the Project")
    st.markdown(
        """
        The **Silicon Wafer Defect Classification** system is designed to automate the process of quality 
        assurance in semiconductor fabrication. By leveraging state-of-the-art computer vision models, the system 
        can recognize spatial arrangements of defects on wafer maps instantly, assisting yield engineers in fast 
        diagnostics and downtime reduction.
        """
    )
    
    st.divider()
    
    st.subheader("🛠️ Technical Specifications")
    
    # Detail table or key-value list using columns
    col_label, col_val = st.columns([1, 2])
    
    with col_label:
        st.markdown("**Framework**")
        st.markdown("**Deep Learning Engine**")
        st.markdown("**Model Architecture**")
        st.markdown("**Dataset Reference**")
        st.markdown("**Author**")
        
    with col_val:
        st.markdown("Streamlit")
        st.markdown("PyTorch")
        st.markdown("EfficientNet-B2")
        st.markdown("WM-811K (LSWMD)")
        st.markdown("*(Leave blank)*")
        
    st.divider()
    
    with st.container(border=True):
        st.markdown("### 🎯 Project Goals")
        st.markdown(
            """
            1. **High Precision Classification:** Maximize macro F1 performance on highly imbalanced wafer maps.
            2. **Rapid Deployment:** Enable lightweight inference setups that run locally on low-cost devices.
            3. **Interactive Visualizations:** Offer clear dashboards for operators and engineers to analyze 
               defect signatures with statistical confidence.
            """
        )
