import streamlit as st
import pandas as pd

st.title("Department of Education Data Table")

# Load CSV file
df = pd.read_csv('licitaciones_data.csv')

# Display the DataFrame as an interactive table
st.dataframe(df)
