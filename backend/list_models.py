import os, requests
from dotenv import load_dotenv
load_dotenv(".env", override=True)
key = os.getenv("GEMINI_API_KEY")
r = requests.get(
    "https://generativelanguage.googleapis.com/v1beta/models",
    params={"key": key, "pageSize": 100},
    timeout=30,
)
print("Status:", r.status_code)
for m in r.json().get("models", []):
    if "generateContent" in m.get("supportedGenerationMethods", []):
        print(m["name"])