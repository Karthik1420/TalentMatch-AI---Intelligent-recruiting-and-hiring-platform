# pyrefly: ignore [missing-import]
from google import genai
# pyrefly: ignore [missing-import]
from google.genai import types
import config
from sqlalchemy.orm import Session
import models
import json

from database import SessionLocal

def evaluate_candidate_application(application_id: int):
    db = SessionLocal()
    try:
        # Fetch application
        application = db.query(models.JobApplication).filter(models.JobApplication.id == application_id).first()
        if not application:
            print(f"Application {application_id} not found.")
            return
            
        job = application.job
        candidate_id = application.candidate_id
        
        # Get actual user_id for the recruiter
        recruiter_profile = db.query(models.Recruiter).filter(models.Recruiter.id == job.posted_by).first()
        recruiter_id = recruiter_profile.user_id if recruiter_profile else job.posted_by
        
        # Fetch full candidate portfolio
        try:
            from services.candidate_service import get_full_portfolio
            portfolio = get_full_portfolio(db, candidate_id)
        except Exception as e:
            print(f"Error fetching portfolio for {candidate_id}: {e}")
            return
            
        # Construct prompt
        prompt = f"""
        You are an expert ATS (Applicant Tracking System) Evaluator.
        Compare the following Candidate Profile against the Job Description and evaluate their compatibility.
        
        JOB DESCRIPTION:
        Title: {job.title}
        Employment Type: {job.employment_type}
        Experience Required: {job.experience_min_years} - {job.experience_max_years} years
        Description: {job.description}
        Responsibilities: {job.responsibilities}
        Requirements: {job.requirements}
        Preferred Qualifications: {job.preferred_qualifications}
        Required Skills: {job.required_skills_text}
        
        CANDIDATE PROFILE:
        Name: {portfolio.profile.first_name} {portfolio.profile.last_name}
        Headline: {portfolio.profile.headline}
        Summary: {portfolio.profile.summary}
        Experience: {[{"company": exp.company_name, "designation": exp.designation, "duration": exp.duration_months, "description": exp.description} for exp in portfolio.experience]}
        Education: {[{"degree": ed.degree, "specialization": ed.specialization, "institution": ed.institution} for ed in portfolio.education]}
        Projects: {[{"title": proj.title, "description": proj.description, "technologies": proj.technologies} for proj in portfolio.projects]}
        Certifications: {[cert.certificate_name for cert in portfolio.certifications]}
        Skills: {[skill.skill.name for skill in portfolio.skills]}
        
        Based on the above, generate a strict JSON response containing the following fields:
        1. "ats_score": An integer between 0 and 100 representing how well the candidate matches the job.
        2. "summary": A concise professional summary explaining how the candidate aligns with the role (recruiter-focused).
        3. "pros": A list of strings representing the candidate's strengths with respect to the job.
        4. "cons": A list of strings representing gaps or weaknesses relative to the Job Description.
        
        Ensure the response is valid JSON and contains ONLY the requested JSON object.
        """
        
        client = genai.Client(api_key=config.GEMINI_API_KEY)
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        result_text = response.text
        evaluation_data = json.loads(result_text)
        
        # Save to database
        ai_eval = models.AIEvaluation(
            application_id=application_id,
            candidate_id=candidate_id,
            recruiter_id=recruiter_id,
            job_id=job.id,
            ats_score=evaluation_data.get("ats_score", 0),
            summary=evaluation_data.get("summary", ""),
            pros=json.dumps(evaluation_data.get("pros", [])),
            cons=json.dumps(evaluation_data.get("cons", []))
        )
        
        db.add(ai_eval)
        db.commit()
        print(f"Successfully generated and stored AI evaluation for application {application_id}")
            
    except Exception as e:
        print(f"Error during AI evaluation for application {application_id}: {e}")
        db.rollback()
    finally:
        db.close()
