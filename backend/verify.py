import urllib.request
import urllib.parse
import json
import ssl

BASE_URL = "https://talentmatch-ai-intelligent-recruiting.onrender.com"
EMAIL = "prajwalganiga06@gmail.com"
PASSWORD = "12345678"

def make_request(method, url, data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        
    req_data = None
    if data:
        req_data = json.dumps(data).encode('utf-8')
        
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 500, str(e)

def verify():
    print(f"Logging in as {EMAIL}...")
    login_data = {"email": EMAIL, "password": PASSWORD}
    status, body = make_request("POST", f"{BASE_URL}/auth/login", data=login_data)
    
    if status != 200:
        print("Login failed:", status, body)
        return
        
    token_data = json.loads(body)
    token = token_data.get("access_token")
    print(f"Logged in successfully. Token: {token[:20]}...")
    
    print("\n--- Testing Profile Update (Step 2) ---")
    update_data = {
        "first_name": "Prajwal",
        "last_name": "Ganiga",
        "headline": "Senior Backend Developer",
        "date_of_birth": "1998-05-12",
        "gender": "Male",
        "phone": "+91 9876543210",
        "email": EMAIL,
        "current_company": "Tech Corp",
        "current_designation": "Backend Developer",
        "current_salary": "150000",
        "expected_salary": "200000",
        "notice_period": "30 days",
        "preferred_location": "Remote",
        "work_authorization": "Citizen",
        "summary": "Experienced backend developer specializing in Python, FastAPI, and PostgreSQL. Passionate about building scalable and performant APIs.",
        "linkedin_url": "https://linkedin.com/in/prajwal-backend",
        "github_url": "https://github.com/prajwal-dev",
        "address": "123 Tech Street",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "tag_ids": [1, 2, 3] # Backend, Python, API tags maybe?
    }
    status, body = make_request("PUT", f"{BASE_URL}/candidate/profile", data=update_data, token=token)
    print("Update profile:", status)
    
    print("\n--- Adding Education ---")
    edu_data = {
        "degree": "B.Tech in Computer Science",
        "specialization": "Software Engineering",
        "institution": "National Institute of Technology",
        "start_year": 2016,
        "end_year": 2020,
        "cgpa": 8.5
    }
    status, body = make_request("POST", f"{BASE_URL}/candidate/education", data=edu_data, token=token)
    print("Add Education:", status)
    
    print("\n--- Adding Experience ---")
    exp_data = {
        "company_name": "Tech Corp",
        "designation": "Backend Developer",
        "employment_type": "Full-time",
        "location": "Bengaluru",
        "start_date": "2020-07-01",
        "currently_working": True,
        "description": "Developing robust RESTful APIs using FastAPI and SQLAlchemy.",
        "achievements": "Reduced response time by 40% through query optimization."
    }
    status, body = make_request("POST", f"{BASE_URL}/candidate/experience", data=exp_data, token=token)
    print("Add Experience:", status)

    print("\n--- Adding Project ---")
    proj_data = {
        "title": "Scalable Chat System",
        "description": "Built a real-time chat application using WebSockets and Redis.",
        "technologies": "FastAPI, Redis, PostgreSQL, React",
        "github_url": "https://github.com/prajwal-dev/chat-system"
    }
    status, body = make_request("POST", f"{BASE_URL}/candidate/projects", data=proj_data, token=token)
    print("Add Project:", status)

    print("\n--- Adding Certification ---")
    cert_data = {
        "certificate_name": "AWS Certified Developer - Associate",
        "issuer": "Amazon Web Services",
        "issue_date": "2023-01-15",
        "credential_url": "https://aws.amazon.com/verification"
    }
    status, body = make_request("POST", f"{BASE_URL}/candidate/certifications", data=cert_data, token=token)
    print("Add Certification:", status)
    
    print("\n--- Fetching Portfolio ---")
    status, body = make_request("GET", f"{BASE_URL}/candidate/portfolio", token=token)
    print("Portfolio response:", status)
    if status == 200:
        print("Portfolio generated successfully!")

if __name__ == "__main__":
    verify()
