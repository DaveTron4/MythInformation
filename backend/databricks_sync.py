import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

def sync_to_lakehouse(nodes, links, table_name="lore_triplets"):
    """
    In a real scenario, this would use the databricks-sdk to upload to Delta Lake.
    For the hackathon, we simulate this by saving a Delta-ready CSV that you can 
    easily import into the Databricks UI.
    """
    df = pd.DataFrame(links)
    
    # Save as CSV for easy Databricks import
    filename = f"db_{table_name}.csv"
    df.to_csv(filename, index=False)
    
    print(f"📊 Data science export ready: {filename}")
    print(f"👉 To impress judges: Upload this to Databricks and run 'SELECT * FROM {table_name}'")
    
    return filename

if __name__ == "__main__":
    # Test data
    sample_links = [
        {"source": "Morgott", "target": "Marika", "label": "SON_OF"},
        {"source": "Morgott", "target": "Mohg", "label": "TWIN_OF"}
    ]
    sync_to_lakehouse([], sample_links)
