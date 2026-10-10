# /// script
# requires-python = ">=3.10"
# dependencies = ["doconda>=0.1", "google-genai>=2.29"]
# ///
"""Gemini on Vertex AI agent that delivers a PowerPoint deck.

Run with uv:  uv run python/vertex_powerpoint.py
Or with pip:  pip install google-genai doconda && python python/vertex_powerpoint.py
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
export GOOGLE_CLOUD_PROJECT=your-project-id
Also needs: Google Cloud credentials (gcloud auth application-default login)
"""

import os

from doconda import Doconda
from google import genai
from google.genai import types

client = genai.Client(vertexai=True, project=os.environ["GOOGLE_CLOUD_PROJECT"], location="europe-west1")
tools = Doconda().tools()
config = types.GenerateContentConfig(
    tools=[
        types.Tool(
            function_declarations=[
                types.FunctionDeclaration(name=t.name, description=t.description, parameters_json_schema=t.input_schema)
                for t in tools
            ]
        )
    ]
)
contents = [
    types.Content(
        role="user", parts=[types.Part.from_text(text="Create a 5-slide presentation on our quarterly results")]
    )
]

while True:
    res = client.models.generate_content(model="gemini-3.8-flash", contents=contents, config=config)
    if not res.function_calls:
        break
    contents.append(res.candidates[0].content)
    parts = [
        types.Part.from_function_response(
            name=c.name, response={"result": next(t for t in tools if t.name == c.name).run(dict(c.args or {}))}
        )
        for c in res.function_calls
    ]
    contents.append(types.Content(role="user", parts=parts))

print(res.text)
