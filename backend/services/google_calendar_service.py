import os
import json
# pyrefly: ignore [missing-import]
from google.oauth2.credentials import Credentials
# pyrefly: ignore [missing-import]
from google_auth_oauthlib.flow import Flow
# pyrefly: ignore [missing-import]
from googleapiclient.discovery import build
from fastapi import HTTPException
from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI

SCOPES = ['https://www.googleapis.com/auth/calendar.events']

def _get_client_config():
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google Calendar API is not configured.")
    return {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "project_id": "talentmatch-ai",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uris": [GOOGLE_REDIRECT_URI]
        }
    }

def get_auth_url(state: str):
    flow = Flow.from_client_config(
        _get_client_config(),
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    # prompt='consent' forces the consent screen and ensures refresh_token is returned
    auth_url, _ = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent',
        state=state
    )
    return auth_url

def exchange_code(code: str):
    flow = Flow.from_client_config(
        _get_client_config(),
        scopes=SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )
    flow.fetch_token(code=code)
    credentials = flow.credentials
    # We only care about the refresh_token for persistent offline access
    return credentials.refresh_token

def create_interview_event(refresh_token: str, candidate_email: str, recruiter_email: str, start_time: str, duration_minutes: int, job_title: str):
    if not refresh_token:
        raise ValueError("Missing Google Calendar refresh token. Please connect your Google account.")
        
    creds = Credentials(
        None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
    )
    
    try:
        service = build('calendar', 'v3', credentials=creds)
        
        from datetime import datetime, timedelta
        # Parse ISO string and add duration
        start_dt = datetime.fromisoformat(str(start_time).replace('Z', '+00:00'))
        if start_dt.tzinfo is None:
            # Assuming UTC if no timezone is provided
            import pytz
            start_dt = start_dt.replace(tzinfo=pytz.UTC)
            
        end_dt = start_dt + timedelta(minutes=duration_minutes)
        
        event = {
            'summary': f"Interview for {job_title}",
            'description': 'Scheduled via TalentMatch AI.',
            'start': {
                'dateTime': start_dt.isoformat(),
            },
            'end': {
                'dateTime': end_dt.isoformat(),
            },
            'attendees': [
                {'email': candidate_email},
                {'email': recruiter_email}
            ],
            'conferenceData': {
                'createRequest': {
                    'requestId': f"talentmatch-{start_dt.timestamp()}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            }
        }
        
        event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1,
            sendUpdates='all'
        ).execute()
        
        return {
            "event_id": event.get('id'),
            "meet_link": event.get('hangoutLink')
        }
    except Exception as e:
        raise Exception(f"Failed to create Google Calendar event: {str(e)}")
