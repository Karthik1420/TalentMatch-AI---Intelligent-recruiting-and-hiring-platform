import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy.orm import Session
from database import SessionLocal
import models

def seed_data():
    db = SessionLocal()
    try:
        # Seed Skills
        trending_skills = [
            "Python", "JavaScript", "React", "Node.js", "SQL",
            "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes",
            "Machine Learning", "Data Analysis", "TypeScript", "Java", "C++",
            "Go", "Rust", "Swift", "Kotlin", "Ruby on Rails",
            "GraphQL", "REST APIs", "Git", "Agile", "Scrum",
            "Figma", "UI/UX Design", "Project Management", "Digital Marketing", "SEO"
        ]
        
        for skill_name in trending_skills:
            existing = db.query(models.Skill).filter(models.Skill.name.ilike(skill_name)).first()
            if not existing:
                new_skill = models.Skill(name=skill_name, category="Trending")
                db.add(new_skill)
                
        # Seed Languages
        trending_languages = [
            "English", "Spanish", "Mandarin", "Hindi", "French",
            "German", "Japanese", "Korean", "Italian", "Portuguese",
            "Russian", "Arabic", "Dutch", "Turkish", "Vietnamese"
        ]
        
        for lang_name in trending_languages:
            existing = db.query(models.Language).filter(models.Language.name.ilike(lang_name)).first()
            if not existing:
                new_lang = models.Language(name=lang_name)
                db.add(new_lang)
                
        db.commit()
        print("Successfully seeded skills and languages!")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
