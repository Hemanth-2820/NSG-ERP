import os
import sys
import asyncio
from fastapi import UploadFile

sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models import User
from app.routers.employee_portal import upload_document

async def test():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.role == "employee").first()
        if not user:
            print("No employee found")
            return
            
        # Create a dummy file
        with open("dummy.pdf", "wb") as f:
            f.write(b"dummy")
            
        with open("dummy.pdf", "rb") as f:
            upload_file = UploadFile(filename="dummy.pdf", file=f)
            print("Uploading document...")
            res = await upload_document(name="Test Doc", file=upload_file, current_user=user, db=db)
            print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test())
