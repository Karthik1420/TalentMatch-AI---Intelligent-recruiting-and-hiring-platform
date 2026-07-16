import urllib.request
import urllib.parse
import json
import ssl

BASE_URL = "http://localhost:8000"
EMAIL = "user8@gmail.com"
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
    
    print("Fetching portfolio...")
    status, body = make_request("GET", f"{BASE_URL}/candidate/portfolio", token=token)
    print("Portfolio response:", status)
    
    print("\n--- Testing Profile Creation (Step 1) ---")
    profile_data = {
        "first_name": "Test",
        "last_name": "User",
        "email": EMAIL,
        "headline": "Software Engineer"
    }
    status, body = make_request("POST", f"{BASE_URL}/candidate/profile", data=profile_data, token=token)
    print("Create profile:", status, body)
    
    print("\n--- Testing Profile Update (Step 2) ---")
    update_data = {
        "current_company": "Tech Corp",
        "current_designation": "Developer"
    }
    status, body = make_request("PUT", f"{BASE_URL}/candidate/profile", data=update_data, token=token)
    print("Update profile (partial):", status, body)

if __name__ == "__main__":
    verify()
