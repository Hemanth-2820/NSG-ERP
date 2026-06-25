import requests

# We need a token. We can simulate the request logic directly or just check uvicorn errors.
# Actually let's just grep the last 50 lines of uvicorn log or check if hr_portal.py has any syntax errors.
import urllib.request
import urllib.error

# Let's check the hr_portal.py for `extract_pdf_text` definition.
with open(r"backend\app\routers\hr_portal.py", 'r', encoding='utf-8') as f:
    content = f.read()
    if "extract_pdf_text" in content:
        print("Endpoint exists")
        
    if "import fitz" in content:
        print("fitz is imported")
