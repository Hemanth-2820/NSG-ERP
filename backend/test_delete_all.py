import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import models
from app.core.security import create_access_token
import requests

def test():
    db = SessionLocal()
    ceo = db.query(models.User).filter(models.User.role == 'ceo').first()
    if not ceo:
        print("No CEO found")
        return
    token = create_access_token({"sub": ceo.email, "role": ceo.role})
    
    anns = db.query(models.Announcement).all()
    print(f"Found {len(anns)} announcements.")
    
    for ann in anns:
        url = f"http://localhost:8000/ceo-portal/announcements/{ann.id}"
        res = requests.delete(url, headers={"Authorization": f"Bearer {token}"})
        if res.status_code != 200:
            print(f"Failed to delete {ann.id}: {res.status_code} {res.text}")
        else:
            print(f"Successfully deleted {ann.id}")

if __name__ == "__main__":
    test()
