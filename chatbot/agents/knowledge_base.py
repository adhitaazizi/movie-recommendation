from neo4j import GraphDatabase

class Neo4jDatabase:
    """Class to handle Neo4j database operations."""
    
    def __init__(self, uri, username, password):
        """Initialize Neo4j connection."""
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
        
    def close(self):
        """Close the driver connection."""
        self.driver.close()
    
    def setup_vector_index(self):
        """Set up or load a vector index in Neo4j for the movie embeddings."""
        with self.driver.session() as session:
            try:
                # Check if the vector index already exists
                check_query = """
                SHOW VECTOR INDEXES YIELD name
                WHERE name = 'overview_embeddings'
                RETURN name
                """
                result = session.run(check_query)
                existing_index = result.single()

                if existing_index:
                    print("Vector index 'overview_embeddings' already exists. No need to create a new one.")
                else:
                    # Create a new vector index if it doesn't exist
                    print("Creating new vector index")
                    query_index = """
                    CREATE VECTOR INDEX overview_embeddings
                    FOR (m:Movie) ON (m.embedding)
                    OPTIONS {indexConfig: {
                        `vector.dimensions`: 768,  
                        `vector.similarity_function`: 'cosine'}}
                    """
                    session.run(query_index)
                    print("Vector index created successfully")
            except Exception as e:
                print(f"Error while setting up vector index: {e}")
    
    def get_movie_recommendations_by_vector(self, user_embedding, top_k=5):
        """
        Get movie recommendations from Neo4j using vector similarity search.
        
        Args:
            user_embedding: Vector representation of user query
            top_k: Number of recommendations to return
        """
        with self.driver.session() as session:
            # Vector similarity search query using the vector index
            query = """
            CALL db.index.vector.queryNodes(
              'overview_embeddings',
              $top_k,
              $embedding
            ) YIELD node, score
            WITH node as m, score
            RETURN m.tmdbId AS id, 
                   m.title AS title,
                   m.overview AS plot, 
                   m.release_date AS released, 
                   m.tagline AS tagline,
                   score
            ORDER BY score DESC
            """
            
            result = session.run(
                query, 
                embedding=user_embedding,
                top_k=top_k
            )
            
            recommendations = [
                {
                    "id": record["id"],
                    "title": record["title"], 
                    "plot": record["plot"],
                    "released": record.get("released", "Unknown"),
                    "tagline": record.get("tagline", ""),
                    "similarity": record.get("score", 0)
                } 
                for record in result
            ]
            return recommendations


def get_ontology_from_neo4j(driver):
    with driver.session() as session:
        result = session.run("CALL db.schema.nodeTypeProperties()")
        
        nodes = {}
        relationships = set()

        for record in result:
            node_labels = record["nodeLabels"]
            property_name = record["propertyName"]
            node_type = ":".join(node_labels)
            nodes.setdefault(node_type, set()).add(property_name)
        
        # Fetch relationships separately
        rel_result = session.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType")
        for record in rel_result:
            relationships.add(record["relationshipType"])

        # Construct ontology string
        ontology_str = ""

        for node, props in nodes.items():
            prop_list = ", ".join(props)
            ontology_str += f"({node}) has properties: {prop_list}\n"

        for rel in relationships:
            ontology_str += f"(:Node)-[:{rel}]->(:Node)\n"

        return ontology_str.strip()