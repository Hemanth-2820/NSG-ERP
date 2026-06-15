import sys
sys.path.append('.')
from app.database import SessionLocal
from app import models

db = SessionLocal()
ann = db.query(models.Announcement).first()
if not ann:
    print("No announcement found")
    sys.exit(0)

print(f"Found ann: {ann.id}")
try:
    db.query(models.AnnouncementRead).filter(models.AnnouncementRead.announcement_id == ann.id).delete(synchronize_session=False)
    db.delete(ann)
    db.commit()
    print("Deleted successfully")
except Exception as e:
    import traceback
    traceback.print_exc()
