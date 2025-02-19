import streamlit as st
import pandas as pd

st.title("Combined Data Dashboard")

# Load CSV data
df1 = pd.read_csv("grants_data.csv")
df2 = pd.read_csv("subastas_data.csv")
df3 = pd.read_csv("licitaciones_data.csv")

# Display tables side by side
col1, col2, col3 = st.columns(3)

with col1:
    st.header("Grants.gov Data")
    st.dataframe(df1)

with col2:
    st.header("ASG Subastas Data")
    st.dataframe(df2)

with col3:
    st.header("Departamento de Educacion Data")
    st.dataframe(df3)
