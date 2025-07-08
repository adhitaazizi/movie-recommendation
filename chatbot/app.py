from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from .agents.recommendation import KnowledgeGraphAgent

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://frontend:3000"])

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Validate required environment variables
required_env_vars = ['NEO4J_URI', 'NEO4J_USER', 'NEO4J_PASSWORD']
missing_vars = [var for var in required_env_vars if not os.getenv(var)]
if missing_vars:
    logger.error(f"Missing required environment variables: {missing_vars}")
    raise ValueError(f"Missing required environment variables: {missing_vars}")

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        agent = KnowledgeGraphAgent(
            os.getenv('NEO4J_URI'),
            os.getenv('NEO4J_USER'),
            os.getenv('NEO4J_PASSWORD')
        )
        agent.close()
        
        return jsonify({
            "status": "healthy", 
            "service": "chatbot-api",
            "database": "connected"
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            "status": "unhealthy", 
            "service": "chatbot-api",
            "error": str(e)
        }), 503

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    agent = None
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        message = data['message']
        user_id = data.get('userId', 'anonymous')
        
        logger.info(f"Processing message from user {user_id}: {message}")
        
        # Initialize the agent
        agent = KnowledgeGraphAgent(
            os.getenv('NEO4J_URI'),
            os.getenv('NEO4J_USER'),
            os.getenv('NEO4J_PASSWORD')
        )
        
        # Process the message
        response_text, movie_ids = agent.process_query(message)
        
        # Prepare response
        if movie_ids:
            response = {
                "text": response_text,
                "movieIds": movie_ids
            }
        else:
            response = {
                "text": response_text,
                "movieIds": []
            }
        
        logger.info(f"Sending response: {response}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "text": "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
            "movieIds": []
        }), 500
    finally:
        if agent:
            agent.close()

@app.route('/api/status', methods=['GET'])
def status():
    """Status endpoint with environment info"""
    return jsonify({
        "service": "chatbot-api",
        "version": "1.0.0",
        "environment": os.getenv('FLASK_ENV', 'development'),
        "neo4j_uri": os.getenv('NEO4J_URI', 'Not configured'),
        "endpoints": [
            "/health - Health check",
            "/api/chat - Chat endpoint",
            "/api/status - This endpoint"
        ]
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting Flask app on port {port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"Neo4j URI: {os.getenv('NEO4J_URI')}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
