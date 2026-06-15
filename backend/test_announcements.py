"""Test the announcements API end-to-end."""
import sys
sys.path.insert(0, '.')
from app.database import SessionLocal
from app.models import User, Announcement
from app.core import security
import requests

BASE = 'http://127.0.0.1:8000'

# 1. Get a CEO user token
db = SessionLocal()
user = db.query(User).filter(User.role == 'ceo').first()
if not user:
    user = db.query(User).filter(User.role == 'admin').first()
if not user:
    print("ERROR: No CEO/admin user found!")
    db.close()
    sys.exit(1)

print(f"Using user: {user.name} ({user.email}, role={user.role})")
token = security.create_access_token(data={'sub': user.email})
db.close()

headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# 2. Test GET announcements
print("\n--- TEST 1: GET /ceo-portal/announcements ---")
res = requests.get(f'{BASE}/ceo-portal/announcements', headers=headers)
print(f"Status: {res.status_code}")
print(f"Body: {res.text[:200]}")

# 3. Test POST announcement
print("\n--- TEST 2: POST /ceo-portal/announcements ---")
payload = {
    'title': 'Test Announcement from Script',
    'body': 'This is a test message body.',
    'priority': 'Normal',
    'audience': 'All Portals'
}
res = requests.post(f'{BASE}/ceo-portal/announcements', headers=headers, json=payload)
print(f"Status: {res.status_code}")
print(f"Body: {res.text[:300]}")

if res.status_code == 201:
    ann_id = res.json()['id']
    print(f"\nCreated announcement ID: {ann_id}")
    
    # 4. Test GET again to verify it shows up
    print("\n--- TEST 3: GET announcements (should include new one) ---")
    res2 = requests.get(f'{BASE}/ceo-portal/announcements', headers=headers)
    print(f"Status: {res2.status_code}")
    data = res2.json()
    print(f"Total announcements: {len(data)}")
    for a in data:
        print(f"  - [{a['id']}] {a['title']} | {a['audience']} | {a['priority']}")
    
    # 5. Test DELETE
    print(f"\n--- TEST 4: DELETE /ceo-portal/announcements/{ann_id} ---")
    res3 = requests.delete(f'{BASE}/ceo-portal/announcements/{ann_id}', headers=headers)
    print(f"Status: {res3.status_code}")
    print(f"Body: {res3.text}")
else:
    print(f"\nPOST FAILED! Full response: {res.text}")

print("\n=== ALL TESTS COMPLETE ===")
