import requests
import io
import docx

# Create a dummy docx
doc = docx.Document()
doc.add_paragraph('Hello world')
doc_bytes = io.BytesIO()
doc.save(doc_bytes)
doc_bytes.seek(0)

# We need an admin token
# But wait, we can just hit the endpoint if we login first
# Or just read the FastAPI code to see if there's an issue with the endpoint

