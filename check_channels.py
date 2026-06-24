import json
import sqlite3
import os

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import sys
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from app import models
    from app.config import settings

    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    channels = session.query(models.ChatChannel).all()
    print("Channels:")
    for ch in channels:
        if ch.id.startswith('dm-'):
            print(ch.id, ch.members)

except Exception as e:
    print("Error:", e)
