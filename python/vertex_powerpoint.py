"""Gemini on Vertex AI agent that delivers a PowerPoint deck.

pip install google-genai doconda
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
Also needs: Google Cloud credentials (gcloud auth application-default login)
"""

from doconda import Doconda
from google import genai
from google.genai import types

client = genai.Client(vertexai=True, project="my-project", location="europe-west1")
tools = Doconda().tools()
config = types.GenerateContentConfig(
    tools=[types.Tool(function_declarations=[
        types.FunctionDeclaration(name=t.name, description=t.description, parameters_json_schema=t.input_schema) for t in tools
    ])]
)
contents = [types.Content(role="user", parts=[types.Part.from_text(text="Create a 5-slide presentation on our quarterly results")])]

while True:
    res = client.models.generate_content(model="gemini-3.8-flash", contents=contents, config=config)
    if not res.function_calls:
        break
    contents.append(res.candidates[0].content)
    parts = [
        types.Part.from_function_response(name=c.name, response={"result": next(t for t in tools if t.name == c.name).run(dict(c.args or {}))})
        for c in res.function_calls
    ]
    contents.append(types.Content(role="user", parts=parts))

print(res.text)
