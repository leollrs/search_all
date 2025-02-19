import pandas as pd

# --- Step 1: Load CSV Files ---
df1 = pd.read_csv("grants_data.csv")
df2 = pd.read_csv("subastas_data.csv")
df3 = pd.read_csv("licitaciones_data.csv")

# Merge the DataFrames (union of columns)
df = pd.concat([df1, df2, df3], ignore_index=True, sort=False)

# --- Step 2: Create Unified Columns ---
def get_unified_title(row):
    """
    Combine candidate title columns into one.
    Always include 'Grant title' first (if available), then 'Title', 'Título', and 'Titulo'.
    """
    candidates = ["Grant Title", "Title", "Título", "Titulo"]
    parts = [str(row[col]).strip() for col in candidates if col in row and pd.notna(row[col]) and str(row[col]).strip() != ""]
    return " | ".join(parts) if parts else "nan"

def get_unified_description(row):
    """
    Combine candidate description columns ("Description" and "Descripcion") into one.
    """
    candidates = ["Description", "Descripcion"]
    parts = [str(row[col]).strip() for col in candidates if col in row and pd.notna(row[col]) and str(row[col]).strip() != ""]
    return " | ".join(parts) if parts else "nan"

# Create unified columns
df["Unified Title"] = df.apply(get_unified_title, axis=1)
df["Unified Description"] = df.apply(get_unified_description, axis=1)

# --- Step 3: Clean Up & Reorder Columns ---

# Drop the original "Grant title" column if it exists.
if "Grant title" in df.columns:
    df.drop(columns=["Grant Title"], inplace=True)

# Reorder columns so that "Unified Title" is the first column.
cols = df.columns.tolist()
if "Unified Title" in cols:
    cols.remove("Unified Title")
    cols = ["Unified Title"] + cols
df = df[cols]

# --- Step 4: Write the Combined CSV ---
output_file = "combined.csv"
df.to_csv(output_file, index=False)
print(f"Combined CSV file created as '{output_file}'")


