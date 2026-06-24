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

    messages = session.query(models.ChatMessage).order_by(models.ChatMessage.timestamp.desc()).limit(10).all()
    print("Latest 10 messages:")
    for m in messages:
        print(f"ID: {m.id}, Channel: {m.channel_id}, Sender: '{m.sender}', Text: '{m.text}'")

except Exception as e:
    print("Error:", e)
