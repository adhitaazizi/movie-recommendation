from neo4j import GraphDatabase

class Neo4jDatabase:    
    def __init__(self, uri, username, password):
        """Initialize Neo4j connection."""
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
        
    def close(self):
        """Close the driver connection."""
        self.driver.close()
    
    def get_movie_recommendations_by_vector(self, user_embedding, top_k=5):
        with self.driver.session() as session:
            # Vector similarity search query using the vector index
            query = """
            CALL db.index.vector.queryNodes(
              'movie_embeddings',
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


# show the schema of the knowledge base
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