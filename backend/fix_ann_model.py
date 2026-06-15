with open('app/models.py', 'r') as f:
    content = f.read()

import re
content = re.sub(
    r'class Announcement\(Base\):\n\s*__tablename__ = "announcements"\n\s*id = Column\(Integer, primary_key=True, index=True\)\n\s*title = Column\(String, nullable=False\)\n\s*body = Column\(Text, nullable=False\)\n\s*priority = Column\(String, default="Normal"\)\n\s*audience = Column\(String, default="All Portals"\)\n\s*author = Column\(String, nullable=True\)\n\s*created_at = Column\(DateTime\(timezone=True\), server_default=func\.now\(\)\)',
    '''class Announcement(Base):
    __tablename__ = "announcements"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    priority = Column(String, default="Normal")
    audience = Column(String, default="All Portals")
    author = Column(String, nullable=True)
    read_count = Column(Integer, default=0)
    read_pct = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())''',
    content
)

with open('app/models.py', 'w') as f:
    f.write(content)
