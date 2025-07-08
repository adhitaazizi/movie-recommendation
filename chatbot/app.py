from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from agents.recommendation import KnowledgeGraphAgent

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "chatbot-api"}), 200

@app.route('/api/chat', methods=['POST'])
def chat():

    response = {}
    """Main chat endpoint"""
    try:
        data = request.get_json()

        agent  = KnowledgeGraphAgent(
            os.getenv('NEO4J_URI'),
            os.getenv('NEO4J_USER'),
            os.getenv('NEO4J_PASSWORD')
        )
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        message = data['message']
        user_id = data.get('userId', 'anonymous')
        
        logger.info(f"Processing message from user {user_id}: {message}")
        
        # Process the message
        response_text, movie_ids = agent.process_query(message)
        
        # Get movie recommendations if needed
        if not movie_ids:
            response = {
                "text": response_text,
                "movieIds": movie_ids
            }
        else:
            response = {
                "text": response_text,
            }
        
        
        logger.info(f"Sending response: {response}")
        agent.close()
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        return jsonify({
            "error": "Internal server error",
            "text": "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
            "movieIds": []
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
