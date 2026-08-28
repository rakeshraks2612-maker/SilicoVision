import os
# Prevent duplicate OpenMP library initialization crashes on Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

# Pre-load native C-extension libraries on main thread to avoid sub-thread loading crashes
import torch
import torchvision
import cv2
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
import plotly.graph_objects as go

import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="Wafer AI Dashboard",
    page_icon="🔬",
    layout="wide"
)

def inject_nvidia_theme(disable_anim=False):
    # CSS overrides: Glassmorphic cards, transparent content containers, hover glow
    background_styles = ""
    if disable_anim:
        background_styles = """
        html, body, .stApp, [data-testid="stAppViewContainer"] {
            background-color: #040405 !important;
            color: #ececec !important;
            background-image: 
                radial-gradient(circle at 50% 30%, rgba(118, 185, 0, 0.05) 0%, transparent 60%),
                linear-gradient(rgba(255,255,255,0.003) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.003) 1px, transparent 1px) !important;
            background-size: 100% 100%, 35px 35px, 35px 35px !important;
            font-family: 'Inter', sans-serif !important;
        }
        """
    else:
        background_styles = """
        html, body, .stApp, [data-testid="stAppViewContainer"], [data-testid="stMain"], [data-testid="stMainBlockContainer"], .main, .block-container {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            color: #ececec !important;
            font-family: 'Inter', sans-serif !important;
        }
        """

    st.markdown(
        f"""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        {background_styles}
        
        /* Smooth page fade-in transition */
        @keyframes pageFadeIn {{
            from {{ opacity: 0; transform: translateY(8px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        .element-container, .block-container, [data-testid="stVerticalBlock"] > div {{
            animation: pageFadeIn 0.4s ease-out forwards;
        }}
        
        /* Metric card breathing glowing borders transitioning green to cyan */
        @keyframes borderGlow {{
            0% {{ border-color: rgba(118, 185, 0, 0.22); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 5px rgba(118, 185, 0, 0.1); }}
            50% {{ border-color: rgba(0, 229, 255, 0.35); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 229, 255, 0.15); }}
            100% {{ border-color: rgba(118, 185, 0, 0.22); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 5px rgba(118, 185, 0, 0.1); }}
        }}
        
        [data-testid="stHeader"] {{
            background-color: transparent !important;
        }}
        
        /* Glassmorphic Sidebar (Taskbar) styling */
        section[data-testid="stSidebar"], [data-testid="stSidebarUserContent"], .stSidebar {{
            background-color: rgba(6, 6, 6, 0.55) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
            border-right: 1px solid rgba(118, 185, 0, 0.15) !important;
            transition: all 0.3s ease !important;
        }}
        
        [data-testid="stSidebar"] hr {{
            border-color: rgba(118, 185, 0, 0.15) !important;
        }}
        
        /* Sidebar hover selections */
        [data-testid="stSidebar"] div[role="radiogroup"] label {{
            border-radius: 8px !important;
            padding: 6px 12px !important;
            margin-bottom: 2px !important;
            transition: all 0.25s ease !important;
        }}
        [data-testid="stSidebar"] div[role="radiogroup"] label:hover {{
            background-color: rgba(118, 185, 0, 0.08) !important;
            color: #76B900 !important;
        }}
        
        /* Metric card styling (Glassmorphism + Animated Glowing Borders) */
        div[data-testid="stMetric"], .stMetric, [data-testid="metric-container"] {{
            background-color: rgba(10, 10, 10, 0.75) !important;
            border: 1px solid rgba(118, 185, 0, 0.2) !important;
            border-radius: 12px !important;
            padding: 18px 24px !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            animation: borderGlow 6s ease-in-out infinite !important;
            transition: all 0.3s ease-in-out !important;
        }}
        
        div[data-testid="stMetric"]:hover, .stMetric:hover {{
            border: 1px solid rgba(0, 229, 255, 0.6) !important;
            box-shadow: 0 0 25px rgba(0, 229, 255, 0.2) !important;
            transform: translateY(-3px) !important;
        }}
        
        div[data-testid="stMetricLabel"] > div, [data-testid="metric-container"] label {{
            color: #aaaaaa !important;
            font-weight: 500 !important;
            font-size: 14px !important;
        }}
        
        div[data-testid="stMetricValue"] > div, [data-testid="metric-container"] [data-testid="stMetricValue"] {{
            color: #76B900 !important;
            font-weight: 800 !important;
            font-size: 32px !important;
        }}
        
        /* Bordered card container styling (Glassmorphism + subtle hover glow) */
        div[data-testid="stVerticalBlockBorderWrapper"], .stVerticalBlockBorderWrapper {{
            background-color: rgba(10, 10, 10, 0.65) !important;
            border: 1px solid rgba(118, 185, 0, 0.18) !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            transition: all 0.3s ease-in-out !important;
        }}
        
        div[data-testid="stVerticalBlockBorderWrapper"]:hover, .stVerticalBlockBorderWrapper:hover {{
            border: 1px solid rgba(118, 185, 0, 0.5) !important;
            box-shadow: 0 0 25px rgba(118, 185, 0, 0.15) !important;
            transform: translateY(-1px) !important;
        }}
        
        /* Accent colored headers */
        h1, h2, h3, h4, h5, h6, .stSubheader {{
            color: #ffffff !important;
            font-family: 'Inter', sans-serif !important;
        }}
        
        /* Buttons styling with hover scaling */
        div.stButton > button, button[kind="primary"] {{
            background-color: #76B900 !important;
            color: #000000 !important;
            font-weight: 700 !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 10px 24px !important;
            transition: all 0.3s ease-in-out !important;
        }}
        
        div.stButton > button:hover, button[kind="primary"]:hover {{
            background-color: #8ce000 !important;
            box-shadow: 0 0 15px rgba(118, 185, 0, 0.4) !important;
            transform: scale(1.02) !important;
        }}
        
        div[data-baseweb="select"] > div {{
            background-color: #0e0e0e !important;
            border: 1px solid rgba(118, 185, 0, 0.25) !important;
            color: #ffffff !important;
        }}
        
        div[data-testid="stFileUploader"] {{
            background-color: rgba(12, 12, 12, 0.65) !important;
            border: 1px dashed rgba(118, 185, 0, 0.25) !important;
            border-radius: 12px !important;
            padding: 20px !important;
        }}
        </style>
        """,
        unsafe_allow_html=True
    )

    if disable_anim:
        # Clean script to remove running Canvas element
        components.html(
            """
            <script>
            (function() {
                const parentDoc = window.parent.document;
                const canvas = parentDoc.getElementById('ai-premium-canvas');
                if (canvas) {
                    canvas.remove();
                }
            })();
            </script>
            """,
            height=0,
            width=0
        )
    else:
        # Full HTML Canvas graphics rendering flow
        components.html(
            """
            <script>
            (function() {
                const parentDoc = window.parent.document;
                if (parentDoc.getElementById('ai-premium-canvas')) return;
                
                const canvas = parentDoc.createElement('canvas');
                canvas.id = 'ai-premium-canvas';
                canvas.style.position = 'fixed';
                canvas.style.top = '0';
                canvas.style.left = '0';
                canvas.style.width = '100vw';
                canvas.style.height = '100vh';
                canvas.style.zIndex = '-999';
                canvas.style.pointerEvents = 'none';
                canvas.style.opacity = '0.65';
                parentDoc.body.appendChild(canvas);
                
                const ctx = canvas.getContext('2d');
                let width = canvas.width = window.parent.innerWidth;
                let height = canvas.height = window.parent.innerHeight;
                
                window.parent.addEventListener('resize', () => {
                    width = canvas.width = window.parent.innerWidth;
                    height = canvas.height = window.parent.innerHeight;
                });
                
                let waveOffset = 0;
                let gridOffset = 0;
                
                const particles = [];
                const particleCount = 75;
                const geos = [];
                const geoCount = 12;
                
                // Initialize standard floating nodes
                for (let i = 0; i < particleCount; i++) {
                    particles.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        r: Math.random() * 1.5 + 0.6,
                        vx: (Math.random() - 0.5) * 0.3,
                        vy: (Math.random() - 0.5) * 0.3,
                        color: Math.random() > 0.4 ? 'rgba(118, 185, 0, ' : 'rgba(0, 229, 255, ',
                        alpha: Math.random() * 0.4 + 0.15
                    });
                }
                
                // Initialize geometric particles (semiconductor grid blocks)
                for (let i = 0; i < geoCount; i++) {
                    geos.push({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        size: Math.random() * 12 + 6,
                        type: Math.random() > 0.5 ? 'triangle' : 'square',
                        vx: (Math.random() - 0.5) * 0.15,
                        vy: (Math.random() - 0.5) * 0.15,
                        angle: Math.random() * Math.PI,
                        vAngle: (Math.random() - 0.5) * 0.004,
                        color: Math.random() > 0.5 ? 'rgba(0, 230, 118, 0.07)' : 'rgba(0, 229, 255, 0.07)'
                    });
                }
                
                function draw() {
                    ctx.clearRect(0, 0, width, height);
                    
                    // Draw deep background color gradient
                    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
                    bgGrad.addColorStop(0, '#040405');
                    bgGrad.addColorStop(1, '#020202');
                    ctx.fillStyle = bgGrad;
                    ctx.fillRect(0, 0, width, height);
                    
                    // Draw moving digital grid lines
                    ctx.strokeStyle = 'rgba(118, 185, 0, 0.015)';
                    ctx.lineWidth = 0.5;
                    gridOffset = (gridOffset + 0.2) % 40;
                    
                    for (let y = gridOffset; y < height; y += 40) {
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(width, y);
                        ctx.stroke();
                    }
                    for (let x = 0; x < width; x += 40) {
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, height);
                        ctx.stroke();
                    }
                    
                    // Soft glowing ambient nebula at center
                    const nebulaGrad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, Math.min(width, height) * 0.45);
                    nebulaGrad.addColorStop(0, 'rgba(118, 185, 0, 0.06)');
                    nebulaGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.02)');
                    nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    ctx.fillStyle = nebulaGrad;
                    ctx.beginPath();
                    ctx.arc(width/2, height/2, Math.min(width, height) * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Draw background waveform curves
                    waveOffset += 0.003;
                    ctx.strokeStyle = 'rgba(0, 229, 255, 0.02)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    for (let x = 0; x < width; x += 5) {
                        const y = height * 0.75 + Math.sin(x * 0.003 + waveOffset) * 45 + Math.cos(x * 0.0015 + waveOffset * 0.5) * 20;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    
                    // Draw connected floating particles
                    for (let i = 0; i < particles.length; i++) {
                        const p = particles[i];
                        p.x += p.vx + Math.sin(p.y * 0.01 + waveOffset) * 0.05;
                        p.y += p.vy;
                        
                        if (p.x < 0) p.x = width;
                        if (p.x > width) p.x = 0;
                        if (p.y < 0) p.y = height;
                        if (p.y > height) p.y = 0;
                        
                        ctx.fillStyle = p.color + p.alpha + ')';
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                        ctx.fill();
                        
                        for (let j = i + 1; j < particles.length; j++) {
                            const p2 = particles[j];
                            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
                            if (dist < 110) {
                                ctx.strokeStyle = `rgba(118, 185, 0, ${0.05 * (1 - dist/110)})`;
                                ctx.lineWidth = 0.5;
                                ctx.beginPath();
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
                        }
                    }
                    
                    // Draw rotating geometric particles
                    for (let i = 0; i < geos.length; i++) {
                        const g = geos[i];
                        g.x += g.vx;
                        g.y += g.vy;
                        g.angle += g.vAngle;
                        
                        if (g.x < -g.size) g.x = width + g.size;
                        if (g.x > width + g.size) g.x = -g.size;
                        if (g.y < -g.size) g.y = height + g.size;
                        if (g.y > height + g.size) g.y = -g.size;
                        
                        ctx.strokeStyle = g.color;
                        ctx.lineWidth = 0.75;
                        ctx.save();
                        ctx.translate(g.x, g.y);
                        ctx.rotate(g.angle);
                        
                        ctx.beginPath();
                        if (g.type === 'triangle') {
                            ctx.moveTo(0, -g.size/2);
                            ctx.lineTo(g.size/2, g.size/2);
                            ctx.lineTo(-g.size/2, g.size/2);
                            ctx.closePath();
                        } else {
                            ctx.rect(-g.size/2, -g.size/2, g.size, g.size);
                        }
                        ctx.stroke();
                        ctx.restore();
                    }
                    
                    window.parent.requestAnimationFrame(draw);
                }
                
                draw();
            })();
            </script>
            """,
            height=0,
            width=0
        )

from frontend.Home import show as show_home
from frontend.Predict import show as show_predict
from frontend.Performance import show as show_performance
from frontend.Dataset import show as show_dataset
from frontend.About import show as show_about

# Sidebar layout
st.sidebar.title("🔬 Wafer AI Dashboard")
st.sidebar.markdown("---")

page = st.sidebar.radio(
    "Go to:",
    [
        "🏠 Home",
        "🔍 Predict",
        "📊 Performance",
        "📦 Dataset",
        "ℹ️ About"
    ]
)

st.sidebar.markdown("---")
st.sidebar.subheader("🎨 Customization")
disable_anim = st.sidebar.checkbox(
    "Disable BG Animation", 
    value=False, 
    help="Disable particles, digital grids and signal wave animations to save CPU/GPU cycles."
)

# Apply global styling based on checkbox setting
inject_nvidia_theme(disable_anim=disable_anim)

st.sidebar.markdown("---")
st.sidebar.caption("v1.0.0 | Silicon Wafer Defect Classification")

# Page Routing
if page == "🏠 Home":
    show_home()
elif page == "🔍 Predict":
    show_predict()
elif page == "📊 Performance":
    show_performance()
elif page == "📦 Dataset":
    show_dataset()
elif page == "ℹ️ About":
    show_about()