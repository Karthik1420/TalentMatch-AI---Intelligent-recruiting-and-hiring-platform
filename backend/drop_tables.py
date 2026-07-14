from database import engine
import models

def drop_all():
    print("Dropping all tables...")
    models.Base.metadata.drop_all(bind=engine)
    print("Tables dropped.")

if __name__ == "__main__":
    drop_all()
