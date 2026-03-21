import os
import sys
from dotenv import load_dotenv
from sqlalchemy import text
from app.database import engine

# Add the backend directory to sys.path so we can import app modules properly
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

def migrate_db():
    print("Starting database migration...")
    
    queries = [
        "ALTER TABLE users ADD COLUMN phone_number VARCHAR;",
        "ALTER TABLE users ADD COLUMN profile_image VARCHAR;",
        "ALTER TABLE users ADD COLUMN address VARCHAR;",
        "ALTER TABLE users ADD COLUMN bio VARCHAR;",
        "ALTER TABLE users ADD COLUMN date_of_birth VARCHAR;"
    ]

    with engine.connect() as conn:
        for q in queries:
            try:
                conn.execute(text(q))
                print(f"Successfully ran: {q}")
            except Exception as e:
                # Typically errors here mean the column already exists
                print(f"Skipping (likely already exists): {q}")
                # print(f"Error details: {e}")
                pass
        
        conn.commit()

    print("Migration complete!")

if __name__ == "__main__":
    migrate_db()
