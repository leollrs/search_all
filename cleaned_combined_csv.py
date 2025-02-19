import pandas as pd

# Define the path to your input CSV file.
input_file = "combined.csv"
output_file = "combined_cleaned.csv"

# Define the columns you want to remove.
columns_to_drop = ['Grant Title', 'Description', 'Title', 'Título', 'Descripcion']

# Read the CSV file.
df = pd.read_csv(input_file)

# Drop the columns if they exist in the DataFrame.
df_cleaned = df.drop(columns=[col for col in columns_to_drop if col in df.columns])

# Save the cleaned DataFrame to a new CSV file.
df_cleaned.to_csv(output_file, index=False)

print(f"Cleaned CSV file saved as {output_file}")
