from database import SessionLocal, engine
import models

def seed():
    # Ensure tables exist
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    predefined_tags = [
        "Full Stack Developer", "Frontend Developer", "Backend Developer", 
        "AI Developer", "Machine Learning Engineer", "Data Scientist", 
        "Python Developer", "Java Developer", "React Developer", 
        "Node.js Developer", "Flutter Developer", "Android Developer", 
        "iOS Developer", "DevOps Engineer", "Cloud Engineer", 
        "Cyber Security Analyst", "UI/UX Designer", "QA Engineer", 
        "Software Engineer", "Product Manager", "Data Analyst", 
        "Business Analyst", "Database Administrator", "AI Engineer", 
        "Prompt Engineer", "Blockchain Developer",
        "React", "FastAPI", "PostgreSQL", "REST API", "Docker", "AWS", "Azure", "GCP"
    ]
    
    for tag_name in predefined_tags:
        existing = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
        if not existing:
            new_tag = models.Tag(name=tag_name)
            db.add(new_tag)
            
    db.commit()
    db.close()
    print("Tags seeded successfully.")

if __name__ == "__main__":
    seed()
