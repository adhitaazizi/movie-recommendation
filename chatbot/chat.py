from agents.recommendation import KnowledgeGraphAgent
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

agent = KnowledgeGraphAgent(
    os.getenv('NEO4J_URI'),
    os.getenv('NEO4J_USER'),
    os.getenv('NEO4J_PASSWORD')
)

# Process the message
response_text, movie_ids = agent.process_query("Give me movies like jurassic park")

print(response_text)
print(movie_ids)

agent.close()
