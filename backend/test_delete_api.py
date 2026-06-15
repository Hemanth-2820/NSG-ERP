import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.core.security import create_access_token

def test():
    db = SessionLocal()
    # 1. find CEO user
    ceo = db.query(models.User).filter(models.User.role == 'ceo').first()
    if not ceo:
        print("No CEO found")
        return
    
    # 2. create token
    token = create_access_token({"sub": ceo.email, "role": ceo.role})
    print(f"Token: {token}")
    
    # 3. Create a dummy announcement
    ann = models.Announcement(title="Test", body="Test body", author="CEO")
    db.add(ann)
    db.commit()
    db.refresh(ann)
    ann_id = ann.id
    print(f"Created dummy ann {ann_id}")
    
    # 4. make request
    import requests
    url = f"http://localhost:8000/ceo-portal/announcements/{ann_id}"
    print(f"DELETE {url}")
    res = requests.delete(url, headers={"Authorization": f"Bearer {token}"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test()
