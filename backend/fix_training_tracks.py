from app.database import engine, SessionLocal
from app import models

db = SessionLocal()
try:
    # Check if track 1 exists
    track = db.query(models.TrainingTrack).filter(models.TrainingTrack.id == 1).first()
    if not track:
        print("Inserting default training track...")
        default_track = models.TrainingTrack(
            id=1,
            name="General Onboarding",
            department="All",
            modules='[{"name": "Company Policies", "duration": "2 hours"}, {"name": "IT Security Basics", "duration": "1 hour"}]',
            is_mandatory=True
        )
        db.add(default_track)
        db.commit()
        print("Default training track inserted successfully.")
    else:
        print("Training track with ID 1 already exists.")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
