from databricks.sql import connect
import os
from datetime import datetime
import threading
import logging

logger = logging.getLogger(__name__)

class DatabricksClient:
    def __init__(self):
        self.conn = None
        self.catalog = os.getenv("DATABRICKS_CATALOG")
        self.schema = os.getenv("DATABRICKS_SCHEMA")
        self._lock = threading.Lock()

    def _connect(self):
        """Lazy connection initialization"""
        if self.conn is None:
            try:
                self.conn = connect(
                    server_hostname=os.getenv("DATABRICKS_HOST"),
                    http_path=os.getenv("DATABRICKS_HTTP_PATH"),
                    personal_access_token=os.getenv("DATABRICKS_TOKEN")
                )
                logger.info("✓ Databricks connection established")
            except Exception as e:
                logger.error(f"Failed to connect to Databricks: {e}")
                self.conn = None

    def _table_name(self, table: str) -> str:
        if self.catalog and self.schema:
            return f"{self.catalog}.{self.schema}.{table}"
        if self.schema:
            return f"{self.schema}.{table}"
        return table
    
    def _insert_data(self, analysis_id: str, user_id: str, nodes: list, links: list):
        """Internal method to insert data (runs in background thread)"""
        try:
            if not self.conn:
                self._connect()
            if not self.conn:
                logger.warning("Databricks connection not available, skipping logging")
                return

            with self._lock:
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
                logger.info(f"✓ Analysis {analysis_id} logged to Databricks")
        except Exception as e:
            logger.error(f"Failed to insert data to Databricks: {e}")

    def log_analysis(self, analysis_id: str, user_id: str, nodes: list, links: list):
        """Log analysis to Databricks asynchronously (non-blocking)"""
        # Run in background thread so it doesn't block the API response
        thread = threading.Thread(
            target=self._insert_data,
            args=(analysis_id, user_id, nodes, links),
            daemon=True
        )
        thread.start()
        logger.info(f"Background task started to log analysis {analysis_id}")