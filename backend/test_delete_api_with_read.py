import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.core.security import create_access_token

def test():
    db = SessionLocal()
    ceo = db.query(models.User).filter(models.User.role == 'ceo').first()
    if not ceo:
        return
    token = create_access_token({"sub": ceo.email, "role": ceo.role})
    
    ann = models.Announcement(title="Test", body="Test body", author="CEO")
    db.add(ann)
    db.commit()
    db.refresh(ann)
    ann_id = ann.id
    
    # Add a read
    read = models.AnnouncementRead(announcement_id=ann_id, user_id=ceo.id)
    db.add(read)
    db.commit()
    
    import requests
    url = f"http://localhost:8000/ceo-portal/announcements/{ann_id}"
    res = requests.delete(url, headers={"Authorization": f"Bearer {token}"})
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")

if __name__ == "__main__":
    test()
