import os
import re

SRC_DIR = '/Users/karthikb/Documents/FULL STACK DEV/BACKEND/TalentMatch-AI/frontend/src'
TARGET_URL = 'https://talentmatch-ai-intelligent-recruiting.onrender.com'
REPLACEMENT = "(import.meta.env.VITE_API_URL || 'https://talentmatch-ai-intelligent-recruiting.onrender.com')"

def refactor_files():
    for root, dirs, files in os.walk(SRC_DIR):
        for file in files:
            if file.endswith(('.js', '.jsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if TARGET_URL in content:
                    # Replace in string literals (single quotes)
                    content = content.replace(f"'{TARGET_URL}", f"{REPLACEMENT} + '")
                    
                    # Replace in string literals (double quotes)
                    content = content.replace(f'"{TARGET_URL}', f'{REPLACEMENT} + "')
                    
                    # Replace in template literals
                    # E.g. `https://talentmatch.../path` -> `${(import.meta...)}/path`
                    content = content.replace(f"`{TARGET_URL}", f"`${{{REPLACEMENT}}}")
                    
                    # For exact matches where the URL is the entire string, e.g. baseURL: 'https://...'
                    # The above would result in REPLACEMENT + '', which is fine in JS (e.g. baseURL: (import...) + '').
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Refactored {filepath}")

if __name__ == '__main__':
    refactor_files()
