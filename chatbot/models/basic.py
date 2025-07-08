import openai
from dotenv import load_dotenv
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

INSTRUCTION_START = "<|startofinstruction|>"
INSTRUCTION_END = "<|endofinstruction|>"
PROMPT_START = "<|startofinput|>"
PROMPT_END = "<|endofinput|>"

def load_prompt(prompt_file: str) -> Tuple[str, str]:
    with open(prompt_file, "r") as f:
        text = f.read()
        system_prompt = (
            text.split(INSTRUCTION_START)[1].split(INSTRUCTION_END)[0].strip()
        )
        prompt = text.split(PROMPT_START)[1].split(PROMPT_END)[0].strip()

    return system_prompt, prompt

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

