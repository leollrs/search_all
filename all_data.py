import streamlit as st
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util

# --- Load the Unified CSV File ---
try:
    df = pd.read_csv("combined_cleaned.csv")
except Exception as e:
    st.error(f"Error loading combined.csv: {e}")
    st.stop()

# Check for required columns
required_columns = {"Unified Title", "Unified Description"}
if not required_columns.issubset(df.columns):
    st.error("The CSV file does not contain the required columns: 'Unified Title' and 'Unified Description'.")
    st.stop()

# Create search_text column if it doesn't exist
if "search_text" not in df.columns:
    df["search_text"] = df["Unified Title"] + " " + df["Unified Description"]

# --- Initialize the SentenceTransformer Model and Compute Embeddings ---
model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
embeddings = model.encode(df["search_text"].tolist(), convert_to_tensor=True)

# --- Build the Unified Proposal Search Dashboard ---
st.title("Unified Proposal Search Dashboard")
st.write("Enter a search query (in English or Spanish) to find relevant proposals:")

query = st.text_input("Search Query:")

if query:
    # Compute embedding for the query.
    query_embedding = model.encode(query, convert_to_tensor=True)
    # Calculate cosine similarity between query embedding and all proposal embeddings.
    cosine_scores = util.cos_sim(query_embedding, embeddings)[0]

    # Get top 5 matching results.
    top_indices = np.argpartition(-cosine_scores.cpu().numpy(), range(5))[:5]
    top_indices = sorted(top_indices, key=lambda i: cosine_scores[i], reverse=True)

    st.subheader("Top Matching Proposals:")
    for idx in top_indices:
        row = df.iloc[idx]
        st.markdown(f"**Unified Title:** {row['Unified Title']}")
        st.markdown(f"**Unified Description:** {row['Unified Description']}")
        st.markdown(f"**Grant Link:** {row.get('Grant Link', 'nan')}")
        st.markdown(f"**Agency:** {row.get('Agency', 'nan')}")
        st.markdown(f"**Deadline:** {row.get('Deadline', 'nan')}")
        st.markdown(f"**Reunión pre subasta:** {row.get('Reunión Pre Subasta', 'nan')}")
        st.markdown(f"**Acto de apertura:** {row.get('Acto de Apertura', 'nan')}")
        st.markdown(f"**Tipo de solicitud:** {row.get('Tipo de Solicitud', 'nan')}")
        st.markdown(f"**Fecha de publicación:** {row.get('Fecha de Publicación', 'nan')}")
        st.markdown(f"**Estado:** {row.get('Estado', 'nan')}")
        st.markdown(f"**Similarity Score:** {cosine_scores[idx].item():.3f}")
        st.markdown("---")
else:
    st.info("Please enter a search query to see results.")

#st.title("Unified Data Table")
#st.dataframe(df)
# --- Display Individual CSV Tables ---
st.title("Individual Data Tables")

try:
    grants_df = pd.read_csv("grants_data.csv")
    st.header("Grants Data")
    st.dataframe(grants_df)
except Exception as e:
    st.error(f"Error loading grants_data.csv: {e}")

try:
    subastas_df = pd.read_csv("subastas_data.csv")
    st.header("Subastas Data")
    st.dataframe(subastas_df)
except Exception as e:
    st.error(f"Error loading subastas_data.csv: {e}")

try:
    licitaciones_df = pd.read_csv("licitaciones_data.csv")
    st.header("Licitaciones Data")
    st.dataframe(licitaciones_df)
except Exception as e:
    st.error(f"Error loading licitaciones_data.csv: {e}")
