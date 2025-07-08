from .knowledge_base import Neo4jDatabase, get_ontology_from_neo4j
from .basic import llm_generate
from .prompts import cypher_generation_prompt, summarize_results_prompt
from vertexai.language_models import TextEmbeddingModel
from dotenv import load_dotenv

load_dotenv()

class KnowledgeGraphAgent:    
    def __init__(self, neo4j_uri, neo4j_user, neo4j_password):
        """Initialize the application with Neo4j and Gemini services."""
        self.neo4j = Neo4jDatabase(neo4j_uri, neo4j_user, neo4j_password)
        self.vector_service = TextEmbeddingModel.from_pretrained("text-embedding-005")
    
    def process_query(self, user_input):
        movie_ids = []
        try:
            query_embedding = self.vector_service.get_embeddings([user_input])[0].values
            print(len(query_embedding))
            vector_results = self.neo4j.get_movie_recommendations_by_vector(query_embedding, top_k=5)
            
            if not vector_results:
                return "Sorry, no relevant results found using vector search."

            context = "Information from vector search:\n"
            for i, result in enumerate(vector_results):
                context += f"[Result {i+1}] Title: {result['title']}\nPlot: {result['plot']}\n\n"
                movie_ids.append(result['id'])


            ontology = get_ontology_from_neo4j(self.neo4j.driver)
            cypher_prompt = cypher_generation_prompt(user_input, context, ontology)
            generated_query = llm_generate(cypher_prompt)


            if generated_query.startswith("```"):
                lines = generated_query.splitlines()
                lines = [line for line in lines if not line.strip().startswith("```")]
                generated_query = "\n".join(lines).strip()
            
            print("Generated Cypher:\n", generated_query)

            with self.neo4j.driver.session() as session:
                result = session.run(generated_query)
                records = [record.data() for record in result]
            
            summary_prompt = summarize_results_prompt(user_input, {"query": generated_query, "results": records}, len(records), str(records))
            summary = llm_generate(summary_prompt)

            return summary, movie_ids

        except Exception as e:
            return f"Error processing query: {str(e)}", ""
    
    def close(self):
        """Close all connections."""
        self.neo4j.close()