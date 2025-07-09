# Movie Recommendation Web

Report is in the [report](./REPORT.md)

Defends on frontend, the app design is common so I use LLM to create the TMDB frontend and plan to change the color later though some aspects are completely different such as the movie and search pages. Furthermore I implement a chatbot for movie qa.

For the backend, the data is from [the movies dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset) which is outdated for 8 years so the qa chatbot would not recognize the past 8 years movies from now. 

There are some apis that I can't manage to complete such as ratings and recommendation system. I planned to use graph based machine learning to build this with this [the movies dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset) due to the columns of user, rating, and movies that can be scheme as bipartite graph. ALthough the data is outdated, the user rate movie data is rare and probably need to scraping.

