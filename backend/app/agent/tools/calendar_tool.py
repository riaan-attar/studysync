from typing import Type, Any # <-- IMPORT Any
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

# REMOVED: from app.services.google_auth import get_user_credentials
# This tool no longer accesses the database or auth service.

class EventInput(BaseModel):
    title: str = Field(description="The title of the event.")
    start_time: str = Field(description="The start date and time in ISO 8601 format (e.g., '2025-09-12T16:00:00').")
    end_time: str = Field(description="The end date and time in ISO 8601 format (e.g., '2025-09-12T17:00:00').")
    location: str = Field(description="The location of the event.")
    description: str = Field(description="A brief description of the event.")
    
    # REMOVED: user_email field. The agent already knows this.

class CreateCalendarEventTool(BaseTool):
    name: str = "create_calendar_event"
    description: str = "Creates a new event in the user's Google Calendar with the provided event details."
    args_schema: Type[EventInput] = EventInput
    
    # --- NEW FIELD ---
    # The Google API service object, initialized and passed in by the agent orchestrator
    service: Any
    user_email: str

    async def _arun(self, title: str, start_time: str, end_time: str, location: str, description: str):
        """Async version of the calendar event creation"""
        try:
            print(f"[DEBUG] Creating calendar event: {title}")
            
            # --- CRITICAL CHANGE ---
            # We no longer get credentials or build the service.
            # We use the 'self.service' object that was passed in.
            
            if not start_time.endswith('Z') and '+' not in start_time and 'T' in start_time:
                start_time = start_time + '+05:30' # Add IST timezone
            if not end_time.endswith('Z') and '+' not in end_time and 'T' in end_time:
                end_time = end_time + '+05:30' # Add IST timezone
            
            event = {
                'summary': title,
                'location': location,
                'description': description,
                'start': {
                    'dateTime': start_time,
                    'timeZone': 'Asia/Kolkata'
                },
                'end': {
                    'dateTime': end_time,
                    'timeZone': 'Asia/Kolkata'
                },
            }
            
            print(f"[DEBUG] Event object: {event}")
            
            created_event = self.service.events().insert(calendarId='primary', body=event).execute()
            
            # --- WHATSAPP NOTIFICATION ---
            try:
                from app.database import SessionLocal
                from app.models import User
                from app.services.whatsapp_service import whatsapp_service
                
                db = SessionLocal()
                try:
                    user_db = db.query(User).filter(User.email == self.user_email).first()
                    if user_db and user_db.phone_number:
                        event_link = created_event.get('htmlLink', '')
                        # Format the start time for the message
                        try:
                            from datetime import datetime
                            # Basic formatting if possible, otherwise use the string
                            dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                            formatted_time = dt.strftime("%B %d, %Y at %I:%M %p")
                        except Exception:
                            formatted_time = start_time

                        await whatsapp_service.send_calendar_notification(
                            to_phone=user_db.phone_number,
                            event_title=title,
                            event_time=formatted_time,
                            event_link=event_link
                        )
                finally:
                    db.close()
            except Exception as e:
                print(f"[WhatsApp] Failed to send calendar notification: {e}")
            # -----------------------------
            
            success_message = f"✅ SUCCESS: Event '{title}' has been created in your Google Calendar for {start_time}! You can view it at: {created_event.get('htmlLink', 'your calendar')}"
            print(f"[DEBUG] {success_message}")
            return success_message
            
        except HttpError as error:
            error_message = f"❌ Google Calendar API error: {error}"
            print(f"[DEBUG] {error_message}")
            return error_message
        except Exception as e:
            error_message = f"❌ An error occurred while creating the calendar event: {str(e)}"
            print(f"[DEBUG] {error_message}")
            return error_message

    def _run(self, title: str, start_time: str, end_time: str, location: str, description: str):
        raise NotImplementedError("This tool is async only.")