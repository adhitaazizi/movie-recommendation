# Movie Recommendation System - Project Report

## Table of Contents
1. [Project Overview](#project-overview)
5. [Prerequisites](#prerequisites)
6. [Step-by-Step Deployment Guide](#step-by-step-deployment-guide)
7. [Troubleshooting](#troubleshooting)
8. [API Documentation](#api-documentation)
9. [Production Considerations](#production-considerations)
10. [Contributing](#contributing)

## Project Overview

This is an intelligent movie recommendation system that combines a modern web frontend with an AI-powered chatbot backend. The system provides personalized movie recommendations using advanced machine learning techniques, natural language processing, and graph database technology.

### Key Features

- **AI-Powered Chatbot**: Natural language interface for movie discovery
- **Personalized Recommendations**: ML-based recommendation engine using Neo4j graph database
- **Vector Similarity Search**: Semantic search using Google Vertex AI embeddings
- **User Management**: Firebase authentication and user profiles
- **Movie Database Integration**: TMDB API integration for comprehensive movie data
- **Responsive Design**: Modern React-based frontend with Tailwind CSS
- **Real-time Chat**: Interactive chatbot interface for movie queries

### Use Cases

- **Movie Discovery**: Find movies based on natural language descriptions
- **Personalized Recommendations**: Get suggestions based on viewing history and preferences
- **Semantic Search**: Search movies using complex queries like "action movies with strong female leads"
- **Movie Information**: Get detailed information about movies, cast, and crew
- **Watchlist Management**: Save and organize movies for later viewing

### Data Flow

1. **User Interaction**: User sends message through frontend chat interface
2. **API Gateway**: Frontend routes request to backend API
3. **AI Processing**: Backend processes query using AI agents
4. **Vector Search**: Query converted to embeddings and searched in Neo4j
5. **Recommendation Engine**: Graph algorithms generate personalized recommendations
6. **Response Generation**: AI agent formats response with movie recommendations
7. **Frontend Display**: Results displayed in user-friendly format

## Prerequisites

Before deploying the application, ensure the following:

### Software Requirements
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository
- **Text Editor**: For configuration files

### API Keys and Services

1. **TMDB API Key**
   - Sign up at [themoviedb.org](https://www.themoviedb.org/)
   - Generate API key from account settings
   - Required for movie data and images

2. **Google Cloud Platform**
   - Create GCP project
   - Enable Vertex AI API
   - Create service account with Vertex AI permissions
   - Download service account JSON key

3. **Firebase Project**
   - Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication and Firestore
   - Get Firebase configuration object

4. **Neo4j Database**
   - Neo4j AuraDB (cloud) or self-hosted instance
   - Database with APOC plugin installed
   - Connection credentials (URI, username, password)

## Step-by-Step Deployment Guide

### Step 1: Clone the Repository

\`\`\`bash
# Clone the repository
git clone https://github.com/adhitaazizi/v0-frontend.git
cd v0-frontend

# Switch to the appropriate branch
git checkout new
\`\`\`

### Step 2: Set Up Environment Variables

#### Backend Environment (.env)

Create `chatbot/.env` file:

\`\`\`bash
# Navigate to chatbot directory
cd chatbot

# Copy example environment file
cp .env.example .env

# Edit the .env file with your credentials
nano .env
\`\`\`

Add the following variables to `chatbot/.env`:

\`\`\`env
# Neo4j Database Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/app/key.json

# TMDB API Configuration
TMDB_API_KEY=your_tmdb_api_key

# OpenAI Configuration (if using OpenAI instead of Vertex AI)
OPENAI_API_KEY=your_openai_api_key

# Flask Configuration
FLASK_ENV=production
PORT=5000
\`\`\`

#### Frontend Environment

Create `frontend/.env.local` file:

\`\`\`bash
# Navigate to frontend directory
cd ../frontend

# Create environment file
touch .env.local

# Edit the file
nano .env.local
\`\`\`

Add the following variables to `frontend/.env.local`:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# TMDB Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=firebase-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
\`\`\`

### Step 3: Set Up Google Cloud Credentials

\`\`\`bash
# Navigate back to chatbot directory
cd ../chatbot

# Copy the Google Cloud service account key
# Replace 'path/to/your/key.json' with actual path
cp path/to/your/service-account-key.json key.json

# Ensure the key file is in the chatbot directory
ls -la key.json
\`\`\`

### Step 4: Set Up Neo4j Database

1. **Create AuraDB Instance**:
   - Go to [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura)
   - Create free instance
   - Note the connection URI and credentials

2. **Load Movie Data**:
    The following data if
   ```cypher
   // Create constraints
   CREATE CONSTRAINT unique_tmdb_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.tmdbId IS UNIQUE;
   CREATE CONSTRAINT unique_movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.movieId IS UNIQUE;
   CREATE CONSTRAINT unique_prod_id IF NOT EXISTS FOR (p:ProductionCompany) REQUIRE p.company_id IS UNIQUE;
   CREATE CONSTRAINT unique_genre_id IF NOT EXISTS FOR (g:Genre) REQUIRE g.genre_id IS UNIQUE;
   CREATE CONSTRAINT unique_lang_id IF NOT EXISTS FOR (l:SpokenLanguage) REQUIRE l.language_code IS UNIQUE;
   CREATE CONSTRAINT unique_country_id IF NOT EXISTS FOR (c:Country) REQUIRE c.country_code IS UNIQUE;

   // Create indexes
   CREATE INDEX actor_id IF NOT EXISTS FOR (p:Person) ON (p.actor_id);
   CREATE INDEX crew_id IF NOT EXISTS FOR (p:Person) ON (p.crew_id);
   CREATE INDEX movieId IF NOT EXISTS FOR (m:Movie) ON (m.movieId);
   CREATE INDEX user_id IF NOT EXISTS FOR (p:Person) ON (p.user_id);

   // Load movie data
   LOAD CSV WITH HEADERS FROM "https://storage.googleapis.com/neo4j-vertexai-codelab/normalized_data/normalized_movies.csv" AS row
   WITH row, toInteger(row.tmdbId) AS tmdbId
   WHERE tmdbId IS NOT NULL
   WITH row, tmdbId
   LIMIT 12000
   MERGE (m:Movie {tmdbId: tmdbId})
   ON CREATE SET m.title = coalesce(row.title, "None"),
                 m.original_title = coalesce(row.original_title, "None"),
                 m.adult = CASE 
                            WHEN toInteger(row.adult) = 1 THEN 'Yes'
                            ELSE 'No'
                        END,
                 m.budget = toInteger(coalesce(row.budget, 0)),
                 m.original_language = coalesce(row.original_language, "None"),
                 m.revenue = toInteger(coalesce(row.revenue, 0)),
                 m.tagline = coalesce(row.tagline, "None"),
                 m.overview = coalesce(row.overview, "None"),
                 m.release_date = coalesce(row.release_date, "None"),
                 m.runtime = toFloat(coalesce(row.runtime, 0)),
                 m.belongs_to_collection = coalesce(row.belongs_to_collection, "None");

   // Load embeddings
   LOAD CSV WITH HEADERS FROM 'https://storage.googleapis.com/neo4j-vertexai-codelab/movie_embeddings.csv' AS row
   WITH row
   MATCH (m:Movie {tmdbId: toInteger(row.tmdbId)})
   SET m.embedding = apoc.convert.fromJsonList(row.embedding);

   // Create vector index
   CREATE VECTOR INDEX movie_embeddings IF NOT EXISTS
   FOR (m:Movie) ON (m.embedding)
   OPTIONS {indexConfig: {
    `vector.dimensions`: 768,
    `vector.similarity_function`: 'cosine'
   }};
   \`\`\`

### Step 5: Build and Deploy with Docker

#### Development Deployment

For development with hot reloading:

\`\`\`bash
# Navigate to project root
cd ..

# Build and start services
docker-compose -f docker-compose.dev.yml up --build

# Or run in detached mode
docker-compose -f docker-compose.dev.yml up --build -d
\`\`\`

#### Production Deployment

For production deployment:

\`\`\`bash
# Build and start services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
\`\`\`

#### Verify Deployment

1. **Check service status**:
\`\`\`bash
docker-compose ps
\`\`\`

2. **View logs**:
\`\`\`bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend
docker-compose logs chatbot
\`\`\`

3. **Test endpoints**:
\`\`\`bash
# Frontend
curl http://localhost:3000

# Backend health check
curl http://localhost:5000/health

# Backend status
curl http://localhost:5000/status
\`\`\`

### Step 6: Access the Application

Once deployed successfully:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Status**: http://localhost:5000/status

## Troubleshooting

### Common Issues and Solutions

#### 1. Container Build Failures

**Problem**: Docker build fails with dependency errors

**Solution**:
\`\`\`bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
\`\`\`

#### 2. Neo4j Connection Issues

**Problem**: Backend cannot connect to Neo4j

**Solutions**:
- Verify Neo4j URI, username, and password in `.env`
- Check Neo4j instance is running and accessible
- Ensure firewall allows connections on port 7687
- Test connection manually:
\`\`\`bash
docker-compose exec chatbot python -c "
from neo4j import GraphDatabase
driver = GraphDatabase.driver('bolt://localhost:7687', auth=('neo4j', 'password'))
with driver.session() as session:
    result = session.run('RETURN 1')
    print('Connection successful')
"
\`\`\`

#### 3. Vertex AI Authentication Errors

**Problem**: Google Cloud authentication fails

**Solutions**:
- Verify `key.json` file exists in chatbot directory
- Check `GOOGLE_CLOUD_PROJECT_ID` is correct
- Ensure Vertex AI API is enabled in your GCP project
- Test authentication:
\`\`\`bash
docker-compose exec chatbot python -c "
import os
from google.cloud import aiplatform
print('Credentials file exists:', os.path.exists('/app/key.json'))
"
\`\`\`

#### 4. Frontend-Backend Communication Issues

**Problem**: Frontend cannot reach backend API

**Solutions**:
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS configuration in backend
- Ensure both services are on the same Docker network
- Test API connectivity:
\`\`\`bash
# From inside frontend container
docker-compose exec frontend curl http://chatbot:5000/health
\`\`\`

#### 5. Port Conflicts

**Problem**: Ports 3000 or 5000 are already in use

**Solutions**:
\`\`\`bash
# Check what's using the ports
lsof -i :3000
lsof -i :5000

# Kill processes or change ports in docker-compose.yml
\`\`\`

#### 6. Environment Variable Issues

**Problem**: Environment variables not loading correctly

**Solutions**:
- Check `.env` file format (no spaces around =)
- Verify file paths in docker-compose.yml
- Restart containers after changing environment variables
\`\`\`bash
docker-compose down
docker-compose up --build
\`\`\`

### Debugging Commands

\`\`\`bash
# Enter running container
docker-compose exec frontend sh
docker-compose exec chatbot bash

# View real-time logs
docker-compose logs -f chatbot

# Restart specific service
docker-compose restart chatbot

# Check container resource usage
docker stats

# Inspect container configuration
docker-compose config

# Check network connectivity
docker-compose exec frontend ping chatbot
\`\`\`

### Log Analysis

\`\`\`bash
# Check application logs
docker-compose logs chatbot | grep ERROR
docker-compose logs frontend | grep error

# Check system logs
docker-compose logs chatbot | tail -100

# Export logs to file
docker-compose logs > application.log
\`\`\`

## API Documentation

### Backend Endpoints

#### Health and Status
- `GET /health` - Basic health check
- `GET /status` - Detailed service status including database connectivity

#### Chat Endpoints
- `POST /api/chat` - Send message to AI chatbot
  \`\`\`json
  {
    "message": "Recommend action movies like John Wick",
    "user_id": "optional_user_id"
  }
  \`\`\`

#### Movie Endpoints
- `GET /api/movies/{tmdbId}` - Get movie details by TMDB ID
- `GET /api/movies/search?q={query}` - Search movies by text query
- `GET /api/movies/recommend?user_id={id}` - Get personalized recommendations

### Frontend API Routes

#### Proxy Routes (in src/app/api/)
- `POST /api/chat` - Proxy to backend chat endpoint
- `GET /api/search` - Proxy to backend search
- `GET /api/recommendations` - Proxy to backend recommendations
- `POST /api/ratings` - Handle user ratings

#### Page Routes
- `/` - Home page with movie discovery
- `/search` - Movie search interface
- `/movie/[id]` - Movie details page
- `/login` - User authentication
- `/signup` - User registration
- `/profile` - User profile management
- `/mylibrary` - User's movie library
- `/recommended` - Personalized recommendations

## Production Considerations

### Security

1. **Environment Variables**: Use Docker secrets or external secret management
\`\`\`yaml
# docker-compose.yml
secrets:
  neo4j_password:
    file: ./secrets/neo4j_password.txt
\`\`\`

2. **HTTPS**: Configure SSL/TLS certificates
\`\`\`yaml
# Add nginx reverse proxy
nginx:
  image: nginx:alpine
  ports:
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - ./ssl:/etc/ssl
\`\`\`

3. **Firewall**: Restrict access to necessary ports only
4. **Authentication**: Implement proper API authentication and rate limiting

### Performance

1. **Caching**: Implement Redis for caching frequent queries
\`\`\`yaml
redis:
  image: redis:alpine
  ports:
    - "6379:6379"
\`\`\`

2. **Load Balancing**: Use Nginx or cloud load balancers
3. **Database Optimization**: Optimize Neo4j queries and indexes
4. **CDN**: Use CDN for static assets

### Monitoring

1. **Logging**: Centralized logging with ELK stack
\`\`\`yaml
elasticsearch:
  image: elasticsearch:7.14.0
logstash:
  image: logstash:7.14.0
kibana:
  image: kibana:7.14.0
\`\`\`

2. **Metrics**: Application and infrastructure monitoring
3. **Health Checks**: Comprehensive health check endpoints
4. **Alerting**: Set up alerts for critical failures

### Scaling

1. **Horizontal Scaling**: Multiple container instances
\`\`\`yaml
chatbot:
  deploy:
    replicas: 3
\`\`\`

2. **Database Scaling**: Neo4j clustering for high availability
3. **Microservices**: Split backend into smaller services
4. **Container Orchestration**: Consider Kubernetes for large deployments

## Contributing

### Development Setup

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Make changes and test locally**
4. **Submit pull request**

### Code Standards

- **Frontend**: ESLint + Prettier configuration
- **Backend**: PEP 8 Python style guide
- **Commits**: Conventional commit messages
- **Testing**: Unit tests for critical functions

### Development Workflow

\`\`\`bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Run tests
docker-compose exec chatbot python -m pytest
docker-compose exec frontend npm test

# Code formatting
docker-compose exec chatbot black .
docker-compose exec frontend npm run lint
\`\`\`

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues and questions:

1. **GitHub Issues**: Create an issue in the repository
2. **Documentation**: Check this README and inline code comments
3. **Community**: Join discussions in GitHub Discussions

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Authors**: Development Team
**Contact**: [Your contact information]
