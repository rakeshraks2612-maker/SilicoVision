import streamlit as st

def show():
    st.title("📦 WM-811K Dataset Overview")
    st.markdown(
        """
        The **WM-811K (LSWMD)** dataset is an industry-standard benchmark dataset for wafer map defect analysis. 
        It consists of 811,110 wafer maps collected from 46,393 lots in real-world fabrication plants. 
        Out of these, 172,950 wafer maps are labeled with specific failure types.
        """
    )
    
    st.divider()
    
    # Dataset Distribution Stats
    with st.container():
        st.markdown("### 📊 Dataset Distribution Statistics")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Total Wafers", "811,110", help="Total wafers in the dataset (labeled + unlabeled).")
        c2.metric("Labeled Wafers", "172,950", help="Wafers with verified defect/normal labels.")
        c3.metric("Defect Classes", "8 Types", help="Distinct defect signature classes.")
        c4.metric("Normal Wafers", "147,435", help="Wafers with no spatial defect patterns.")
        
    st.divider()

    st.markdown("### 🧩 The Eight Wafer Defect Classes")
    st.markdown("Below is a breakdown of the spatial defect patterns categorized in the dataset:")
    
    # Grid of Classes
    row1_cols = st.columns(4)
    row2_cols = st.columns(4)
    
    classes_info = [
        {
            "name": "Center",
            "emoji": "🎯",
            "pattern": "⬤ Clustered in middle",
            "desc": "Defects form a concentrated cluster in the center area of the wafer. Often caused by spinner or chemical delivery issues.",
            "col_idx": 0,
            "row": 1
        },
        {
            "name": "Donut",
            "emoji": "🍩",
            "pattern": "◯ Concentric ring",
            "desc": "Defects form a circular band or ring shape away from the edges, resembling a torus. Typically caused by gas flow or heating loops.",
            "col_idx": 1,
            "row": 1
        },
        {
            "name": "Edge-Loc",
            "emoji": "🌅",
            "pattern": "◑ Clustered at edge",
            "desc": "Defects form a cluster located along the outer periphery of the wafer. Usually associated with handling issues or edge deposition.",
            "col_idx": 2,
            "row": 1
        },
        {
            "name": "Edge-Ring",
            "emoji": "⭕",
            "pattern": "⭕ Complete outer ring",
            "desc": "Defects cover the entire outer rim or circumference of the wafer. Often related to etching chamber boundary effects.",
            "col_idx": 3,
            "row": 1
        },
        {
            "name": "Loc",
            "emoji": "📍",
            "pattern": "⚬ Localized cluster",
            "desc": "A dense cluster of defects located anywhere on the wafer map, excluding the edge and center. Points to local contamination.",
            "col_idx": 0,
            "row": 2
        },
        {
            "name": "Random",
            "emoji": "🎲",
            "pattern": "░ Widespread noise",
            "desc": "Individual defect pixels scattered across the wafer without a clear spatial structure. Associated with random particulate noise.",
            "col_idx": 1,
            "row": 2
        },
        {
            "name": "Scratch",
            "emoji": "➖",
            "pattern": "✏️ Linear/Curved lines",
            "desc": "Defects align in thin linear or curved scratches across the wafer. Caused by mechanical handling arm scratches or friction.",
            "col_idx": 2,
            "row": 2
        },
        {
            "name": "Near-full",
            "emoji": "🚨",
            "pattern": "██ Almost entire wafer",
            "desc": "Wafer shows high defect densities spread over almost the entire surface area. Indicates systemic process failure.",
            "col_idx": 3,
            "row": 2
        }
    ]
    
    for c in classes_info:
        target_col = row1_cols[c["col_idx"]] if c["row"] == 1 else row2_cols[c["col_idx"]]
        with target_col:
            with st.container(border=True):
                st.markdown(f"#### {c['emoji']} {c['name']}")
                st.code(c["pattern"], language="text")
                st.write(c["desc"])
                
    st.divider()
    
    with st.expander("🔍 Dataset Format & Bin Mapping Detail"):
        st.markdown(
            """
            In the raw data, wafer maps are represented as 2D integer grids where:
            - **0** represents the blank space outside the wafer circle.
            - **1** represents the normal silicon wafer area (background).
            - **2** represents a failing bin or defect point.
            
            Deep learning preprocessing typically extracts these maps, resizes them to `224x224` pixels using bilinear or 
            nearest-neighbor interpolation, and passes them to the EfficientNet-B2 neural network as normalized 3-channel images.
            """
        )
