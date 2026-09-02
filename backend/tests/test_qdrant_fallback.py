import pytest
from unittest.mock import patch
import app.core.qdrant as qdrant_module


def test_qdrant_fallback_when_client_missing():
    # Simulate missing QdrantClient module
    with patch.object(qdrant_module, "QdrantClient", None), \
         patch.object(qdrant_module, "qmodels", None):
        
        client = qdrant_module.get_qdrant_client()
        assert client is None
        
        # Ensure init_qdrant_collections does not raise any exception
        qdrant_module.init_qdrant_collections()
