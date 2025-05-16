import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def analyze_ingredients(recipe_text):
    prompt = f"""You are a helpful assistant analyzing food waste risk.
For each ingredient in the following recipe, identify:
- Waste Risk (High, Medium, Low)
- Reason it's often wasted (if applicable)
- Suggest one tip to reduce or reuse waste

Return only valid JSON in the following format:

[
  {{
    "ingredient": "string",
    "waste_risk": "High | Medium | Low",
    "reason": "string",
    "suggestion": "string"
  }},
  ...
]

Recipe:
{recipe_text}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=800
        )

        result_text = response.choices[0].message.content.strip()

        # Parse cleanly with json.loads()
        result = json.loads(result_text)
        return result

    except json.JSONDecodeError as je:
        return [{"ingredient": "Error", "waste_risk": "N/A", "reason": "Invalid JSON from GPT", "suggestion": str(je)}]
    except Exception as e:
        return [{"ingredient": "Error", "waste_risk": "N/A", "reason": str(e), "suggestion": "Check API key or response format"}]


def ask_assistant(question):
    prompt = f"You are a kitchen assistant helping users reduce food waste. Answer this question briefly and helpfully:\n\nUser: {question}\nAssistant:"

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=300
    )

    return response.choices[0].message.content.strip()
