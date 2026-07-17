from database import engine
from sqlalchemy import text
import models

def run_migration():
    models.Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        try:
            conn.execute(text("ALTER TABLE recruiters ADD COLUMN google_refresh_token VARCHAR;"))
            print("Successfully added google_refresh_token column to recruiters table.")
        except Exception as e:
            print(f"Error adding column (it may already exist): {e}")

if __name__ == "__main__":
    run_migration()
