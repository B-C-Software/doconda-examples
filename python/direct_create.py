# /// script
# requires-python = ">=3.10"
# dependencies = ["doconda>=0.2"]
# ///
"""Generate a Word file (and its PDF) with one call, no agent: from a prompt or from Markdown.

Run with uv:  uv run python/direct_create.py
Or with pip:  pip install doconda && python python/direct_create.py
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
"""

from pathlib import Path

from doconda import Doconda

doconda = Doconda()

doc = doconda.documents.create(format="docx", prompt="One-page report on the housing law, with a cover page")
Path("report.docx").write_bytes(doconda.documents.download(doc["id"], "docx"))
Path("report.pdf").write_bytes(doconda.documents.download(doc["id"], "pdf"))

answer = "# Sales\n\n| Month | Sales |\n|---|---|\n| January | 12,400 |"  # what your LLM wrote
doc = doconda.documents.create(format="docx", content={"markdown": answer}, style="dark blue headings")
Path("sales.docx").write_bytes(doconda.documents.download(doc["id"], "docx"))

xlsx = doconda.documents.create(format="xlsx", prompt="Event budget by line item, with totals and VAT")
Path("budget.xlsx").write_bytes(doconda.documents.download(xlsx["id"], "xlsx"))

# Review a Word file of your own (contract.docx is not included in this repo)
reviewed = doconda.documents.create(operation="review", file=doconda.files.upload("contract.docx")["id"])
print(reviewed["status"], doconda.documents.report(reviewed["id"])["issues"])
