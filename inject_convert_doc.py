import re

file_path = r"backend\app\routers\hr_portal.py"
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

endpoints = """
import mammoth

@router.post("/onboarding/convert-doc")
async def convert_doc(
    file: UploadFile = File(...),
    current_user: models.User = Depends(security.get_current_user)
):
    if current_user.role.lower() not in ["hr", "ceo", "admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if not file.filename.endswith(".docx"):
        raise HTTPException(status_code=400, detail="Only .docx files are supported")
        
    try:
        content = await file.read()
        import io
        docx_file = io.BytesIO(content)
        result = mammoth.convert_to_html(docx_file)
        html = result.value
        return {"html": html}
    except Exception as e:
        print(f"Error converting docx: {e}")
        raise HTTPException(status_code=500, detail=str(e))
"""

if "convert_doc" not in content:
    content += endpoints

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Endpoint convert-doc injected")
