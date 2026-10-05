"""Generate a Word file (and its PDF) with one call, no agent: from a prompt or from Markdown.

pip install doconda
export DOCONDA_API_KEY=ak_eu_…  # https://doconda.com
"""

from doconda import Doconda

doconda = Doconda()

doc = doconda.documents.create(format="docx", prompt="One-page report on the housing law, with a cover page")
open("report.docx", "wb").write(doconda.documents.download(doc["id"], "docx"))

answer = "# Sales\n\n| Month | Sales |\n|---|---|\n| January | 12,400 |"  # what your LLM wrote
doc = doconda.documents.create(format="docx", content={"markdown": answer}, style="dark blue headings")
open("sales.docx", "wb").write(doconda.documents.download(doc["id"], "docx"))

xlsx = doconda.documents.create(format="xlsx", prompt="Event budget by line item, with totals and VAT")
open("budget.xlsx", "wb").write(doconda.documents.download(xlsx["id"], "xlsx"))

reviewed = doconda.documents.create(operation="review", file=doconda.files.upload("contract.docx")["id"])
print(reviewed["status"], doconda.documents.report(reviewed["id"])["issues"])
