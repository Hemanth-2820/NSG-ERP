from app.database import engine, Base
from app.models import Announcement, AnnouncementRead

print("Creating Announcements tables...")
Base.metadata.create_all(bind=engine, tables=[Announcement.__table__, AnnouncementRead.__table__])
print("Done!")
