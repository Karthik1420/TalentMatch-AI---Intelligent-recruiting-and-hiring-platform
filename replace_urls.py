import os
import glob

FRONTEND_URL = "https://talentmatchai-xi.vercel.app"
BACKEND_URL = "https://talentmatch-ai-intelligent-recruiting.onrender.com"

# Recursively find all files in the frontend/src and replace http://localhost:8000 with BACKEND_URL
def replace_in_frontend():
    files = glob.glob("/Users/karthikb/Documents/FULL STACK DEV/BACKEND/TalentMatch-AI/frontend/src/**/*.js*", recursive=True)
    count = 0
    for file in files:
        if os.path.isfile(file):
            with open(file, 'r') as f:
                content = f.read()
            if "http://localhost:8000" in content:
                content = content.replace("http://localhost:8000", BACKEND_URL)
                with open(file, 'w') as f:
                    f.write(content)
                count += 1
                print(f"Updated {file}")
    print(f"Updated {count} files in frontend.")

# Replace http://localhost:5173 and http://localhost:8000 in backend
def replace_in_backend():
    files = glob.glob("/Users/karthikb/Documents/FULL STACK DEV/BACKEND/TalentMatch-AI/backend/**/*.py", recursive=True)
    count = 0
    for file in files:
        if "venv" in file: continue
        if os.path.isfile(file):
            with open(file, 'r') as f:
                content = f.read()
            original = content
            content = content.replace("http://localhost:8000", BACKEND_URL)
            content = content.replace("http://localhost:5173", FRONTEND_URL)
            if content != original:
                with open(file, 'w') as f:
                    f.write(content)
                count += 1
                print(f"Updated {file}")
    print(f"Updated {count} files in backend.")

if __name__ == "__main__":
    replace_in_frontend()
    replace_in_backend()
