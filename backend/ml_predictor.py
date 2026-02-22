import pickle
import numpy as np
from typing import Dict, Optional
import logging
import os

logger = logging.getLogger(__name__)

class RelationshipTypePredictor:
    """ML model for predicting relationship types between characters"""
    
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.feature_names = None
        self.is_loaded = False
    
    def load_model(self, model_path: str = None):
        """Load the trained model and label encoder"""
        try:
            if model_path is None:
                # Use absolute path relative to this script
                current_dir = os.path.dirname(os.path.abspath(__file__))
                model_path = os.path.join(current_dir, "models", "relationship_predictor.pkl")
            
            if model_path.endswith('.pkl'):
                if not os.path.exists(model_path):
                    logger.warning(f"Model file not found at {model_path}")
                    self.is_loaded = False
                    return
                
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.model = model_data['model']
                self.label_encoder = model_data['label_encoder']
                self.feature_names = model_data['feature_names']
                self.is_loaded = True
                logger.info("✓ ML model loaded successfully")
            else:
                logger.warning("⚠ Could not load model - using fallback (predictions will return None)")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False

    
    def predict(self, source_centrality: float, target_centrality: float,
                source_name_length: int, target_name_length: int,
                same_work: int, source_in_work: int) -> Dict[str, any]:
        """
        Predict relationship type between two characters
        
        Args:
            source_centrality: degree centrality of source character
            target_centrality: degree centrality of target character
            source_name_length: length of source character name
            target_name_length: length of target character name
            same_work: 1 if characters from same work, 0 otherwise
            source_in_work: 1 if source character is in relationship's work, 0 otherwise
        
        Returns:
            Dict with predicted relationship type and confidence
        """
        if not self.is_loaded or self.model is None:
            return {
                "predicted_relationship": None,
                "confidence": None,
                "error": "Model not loaded"
            }
        
        try:
            # Prepare features
            features = np.array([[
                source_centrality,
                target_centrality,
                source_name_length,
                target_name_length,
                same_work,
                source_in_work
            ]])
            
            # Predict
            prediction_encoded = self.model.predict(features)[0]
            predicted_relationship = self.label_encoder.inverse_transform([prediction_encoded])[0]
            
            # Get confidence (probability of predicted class)
            probabilities = self.model.predict_proba(features)[0]
            confidence = float(np.max(probabilities))
            
            return {
                "predicted_relationship": predicted_relationship,
                "confidence": round(confidence, 3),
                "error": None
            }
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return {
                "predicted_relationship": None,
                "confidence": None,
                "error": str(e)
            }


# Global predictor instance
predictor = RelationshipTypePredictor()
