from databricks.sql import connect
import os
from datetime import datetime

class DatabricksClient:
    def __init__(self):
        self.conn = connect(
            server_hostname=os.getenv("DATABRICKS_HOST"),
            http_path=os.getenv("DATABRICKS_HTTP_PATH"),
            personal_access_token=os.getenv("DATABRICKS_TOKEN")
        )
        self.catalog = os.getenv("DATABRICKS_CATALOG")
        self.schema = os.getenv("DATABRICKS_SCHEMA")

    def _table_name(self, table: str) -> str:
        if self.catalog and self.schema:
            return f"{self.catalog}.{self.schema}.{table}"
        if self.schema:
            return f"{self.schema}.{table}"
        return table
    
    def log_analysis(self, analysis_id: str, user_id: str, nodes: list, links: list):
        """Save analysis to Delta Lake"""
        cursor = self.conn.cursor()
        
        # Set catalog and schema explicitly
        if self.catalog and self.schema:
            cursor.execute(f"USE CATALOG {self.catalog}")
            cursor.execute(f"USE SCHEMA {self.schema}")
        
        # Insert characters
        for node in nodes:
            table_name = self._table_name("lore_characters")
            values = (
                analysis_id,
                node.get('id'),
                node.get('name') or node.get('id'),
                node.get('work'),
                node.get('description', ''),
                node.get('size', 0),
                datetime.utcnow()
            )
            cursor.execute(
                f"""INSERT INTO {table_name} 
                (analysis_id, id, name, work_source, description, degree_centrality, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)""",
                values
            )
        
        # Insert relationships
        for link in links:
            table_name = self._table_name("lore_relationships")
            
            # Extract source and target IDs (handle case where they might be objects)
            source = link.get('source')
            target = link.get('target')
            
            if isinstance(source, dict):
                source = source.get('id')
            if isinstance(target, dict):
                target = target.get('id')
            
            cursor.execute(
                f"""INSERT INTO {table_name}
                (analysis_id, source_id, target_id, relationship_type, work_source, created_at)
                VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    analysis_id,
                    source,
                    target,
                    link.get('label', 'related'),
                    'multi-work',
                    datetime.utcnow()
                )
            )
        
        # Log analysis metadata
        table_name = self._table_name("lore_analyses")
        cursor.execute(
            f"""INSERT INTO {table_name}
            (analysis_id, user_id, name, total_characters, total_relationships, created_at)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (
                analysis_id,
                user_id,
                f"Analysis {datetime.utcnow().strftime('%Y-%m-%d')}",
                len(nodes),
                len(links),
                datetime.utcnow()
            )
        )
        
        cursor.close()