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
    for c in channels:
        print(f"ID: {c.id}, Name: {c.name}, Members: {c.members}")

except Exception as e:
    print("Error:", e)
