from fastapi.testclient import TestClient
from app.main import app
from app import models
from app.core import security
import io
import docx

client = TestClient(app)

# Create a dummy docx
doc = docx.Document()
doc.add_paragraph('Hello world')
doc_bytes = io.BytesIO()
doc.save(doc_bytes)
doc_bytes.seek(0)

# Create a mock user
user = models.User(role="hr", name="Test HR")

def override_get_current_user():
    return user

app.dependency_overrides[security.get_current_user] = override_get_current_user

response = client.post(
    "/api/hr-portal/onboarding/convert-doc",
    files={"file": ("test.docx", doc_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
)

print(response.status_code)
print(response.json())
