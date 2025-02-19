import streamlit as st
import pandas as pd

st.title("ASG Data Table")

# Load CSV file
df = pd.read_csv('subastas_data.csv')

# Display the DataFrame as an interactive table
st.dataframe(df)
