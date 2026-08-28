import streamlit as st

def show():
    # Page Header
    st.title("🔬 Silicon Wafer Defect Classification Dashboard")
    st.markdown(
        """
        An advanced Deep Learning platform powered by **EfficientNet-B2** and trained on the industry-standard 
        **WM-811K (LSWMD)** dataset. This application classifies spatial defect patterns on silicon semiconductor 
        wafers to optimize manufacturing yield and enable automated quality control.
        """
    )
    
    st.markdown("<br>", unsafe_allow_html=True)

    # Metric Cards Container
    with st.container():
        st.subheader("📊 Key Performance Metrics")
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric(
                label="Test Accuracy",
                value="85.81%",
                help="Overall accuracy of the EfficientNet-B2 classifier on the test split."
            )
        with col2:
            st.metric(
                label="Macro F1 Score",
                value="84.40%",
                help="Macro-average F1 score, representing robust performance across all 8 classes."
            )
        with col3:
            st.metric(
                label="ROC AUC",
                value="98.70%",
                help="Area Under the Receiver Operating Characteristic Curve, showing excellent class separation."
            )
        with col4:
            st.metric(
                label="Defect Classes",
                value="8",
                help="Number of spatial defect patterns identified by the classifier."
            )
            
    st.divider()

    # Detailed Content Sections
    col_left, col_right = st.columns(2)

    with col_left:
        with st.container(border=True):
            st.markdown("### 📝 Project Overview")
            st.markdown(
                """
                Semiconductor manufacturing processes are highly sensitive. Spatial defect patterns on silicon wafers 
                frequently occur due to specific equipment issues or process variations. Automatically classifying 
                these defect patterns is crucial for:
                * **Root-Cause Analysis:** Linking pattern types to faulty machine components.
                * **Yield Management:** Taking immediate corrective action to minimize manufacturing waste.
                * **Process Optimization:** Reducing human inspection errors and cycle times.
                
                This dashboard offers clean visual navigation and predictive capabilities to analyze wafer map 
                bin files using modern artificial intelligence.
                """
            )
            
        st.markdown("<br>", unsafe_allow_html=True)
        
        with st.container(border=True):
            st.markdown("### 🛠️ Technologies Used")
            st.markdown(
                """
                - **Python 3.11** — Robust backend computation and data handling.
                - **PyTorch & Torchvision** — State-of-the-art deep learning model building and GPU acceleration.
                - **EfficientNet-B2** — Scalable convolutional neural network optimized for accuracy and computational efficiency.
                - **Streamlit** — Interactive UI and rapid dashboard prototyping.
                - **Matplotlib & Seaborn** — Advanced visualization for confusion matrices and metrics.
                """
            )

    with col_right:
        with st.container(border=True):
            st.markdown("### 🧠 Model Information")
            st.markdown(
                """
                - **Architecture:** EfficientNet-B2
                - **Parameter Count:** ~7.7M parameters (highly lightweight and ideal for edge/line deployment)
                - **Input Shape:** 224 x 224 px, 3 channels (wafer map intensity patterns)
                - **Optimizer:** Adam/AdamW with Cosine Annealing learning rate schedule
                - **Loss Function:** Cross-Entropy Loss with Label Smoothing to handle class imbalance
                - **Training Strategy:** Transfer learning with fine-tuning on wafer maps
                """
            )
            
        st.markdown("<br>", unsafe_allow_html=True)

        with st.container(border=True):
            st.markdown("### 💾 Dataset Information")
            st.markdown(
                """
                - **Dataset Name:** WM-811K (LSWMD)
                - **Total Wafers:** 811,037 wafer maps collected from real fabrication facilities
                - **Labeled Wafers:** 172,950 wafer maps categorized by expert domain engineers
                - **Defect Categories:** 9 classes (8 spatial defect signatures + 1 Normal class)
                - **Classes Modeled:** Center, Donut, Edge-Loc, Edge-Ring, Loc, Random, Scratch, Near-full
                - **Imbalance Ratio:** Highly imbalanced (typical in manufacturing lines, where defects are rare)
                """
            )

    st.divider()
    st.caption("Developed by Wafer AI Team. Powered by PyTorch & Streamlit.")