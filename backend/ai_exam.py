import json
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

# =========================
# 🔐 CONFIG (FIXED)
# =========================



# =========================
# 🤖 AI CHATBOT
# =========================
def ai_chatbot(message: str):
    try:
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # ✅ GROQ MODEL
            messages=[
                {"role": "system", "content": "You are an AI recruitment assistant."},
                {"role": "user", "content": message}
            ],
            temperature=0.7
        )

        return res.choices[0].message.content.strip()

    except Exception as e:
        print("Chatbot Error:", e)
        return "AI not working"


# =========================
# 🧠 GENERATE QUESTIONS
# =========================
def generate_ai_questions(role: str):
    try:
        prompt = f"""
Generate 10 multiple choice questions for {role} role.

STRICT:
- Return ONLY JSON
- No explanation
- No markdown
- Format EXACTLY like this:

[
  {{
    "question": "What is Python?",
    "options": {{
      "A": "Language",
      "B": "Animal",
      "C": "Car",
      "D": "Food"
    }},
    "answer": "A"
  }}
]
"""

        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",   # ✅ WORKING MODEL
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        content = res.choices[0].message.content.strip()

        print("🔥 RAW AI RESPONSE:\n", content)

        return content

    except Exception as e:
        print("AI Error:", e)
        return None


# =========================
# 🔍 PARSE JSON SAFELY
# =========================
def parse_ai_questions(text):
    try:
        if not text:
            return []

        text = text.strip()

        # ❌ remove markdown ```json
        if "```" in text:
            text = text.split("```")[1]

        # ❌ fix trailing commas
        text = text.replace(",}", "}")
        text = text.replace(",]", "]")

        data = json.loads(text)

        # ✅ VALIDATE
        if isinstance(data, list) and len(data) > 0:
            print("✅ Parsed Questions:", len(data))
            return data

    except Exception as e:
        print("❌ JSON Parsing Error:", e)

    return []