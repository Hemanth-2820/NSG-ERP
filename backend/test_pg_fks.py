import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine
from sqlalchemy import inspect

def test():
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Checking foreign keys referencing 'announcements'...")
    for table_name in tables:
        try:
            fks = inspector.get_foreign_keys(table_name)
            for fk in fks:
                if 'announcements' in fk.get('referred_table', ''):
                    print(f"Table '{table_name}' references 'announcements' via columns {fk.get('constrained_columns')}")
        except Exception as e:
            pass
    print("Done")

if __name__ == "__main__":
    test()
