import openai
from dotenv import load_dotenv
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()


def llm_generate(prompt):
    llm = openai.OpenAI(
        base_url = "https://api.fireworks.ai/inference/v1",
        api_key=os.getenv("FIREWORKS_AI_API_KEY"),
    )

    response = llm.chat.completions.create(
        model="accounts/fireworks/models/llama-v3-8b-instruct",
        messages=[{
            "role": "user",
            "content": prompt,
        }],
    )
    return response.choices[0].message.content

