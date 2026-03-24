import os
from wasenderapi import create_async_wasender
from wasenderapi.errors import WasenderAPIError

class WhatsAppService:
    def __init__(self):
        self.api_key = os.getenv("WASENDER_API_KEY")

    async def send_update_notification(self, to_phone: str, update_title: str, update_summary: str):
        if not self.api_key or self.api_key == "your_wasender_api_key_here":
            print(f"[WhatsApp] Warning: WASENDER_API_KEY not configured. Skipping notification to {to_phone}")
            return False

        if not to_phone:
            print("[WhatsApp] Warning: No phone number provided for user. Skipping.")
            return False

        message_body = (
            f"🚨 *StudySync Alert: {update_title}*\n\n"
            f"{update_summary}\n\n"
            f"I have analyzed this from your inbox and updated your dashboard."
        )

        try:
            async_client = create_async_wasender(api_key=self.api_key)
            async with async_client:
                print(f"[WhatsApp] Sending notification to {to_phone}...")
                response = await async_client.send_text(
                    to=to_phone, 
                    text_body=message_body
                )
                print(f"[WhatsApp] ✓ Message sent successfully: ID {response.response.data.message_id}")
                return True
        except WasenderAPIError as e:
            print(f"[WhatsApp] ✗ API Error sending message: {e.message}")
            return False
        except Exception as e:
            print(f"[WhatsApp] ✗ Unexpected error: {e}")
            return False

    async def send_calendar_notification(self, to_phone: str, event_title: str, event_time: str, event_link: str):
        if not self.api_key or self.api_key == "your_wasender_api_key_here":
            print(f"[WhatsApp] Warning: WASENDER_API_KEY not configured. Skipping calendar notification to {to_phone}")
            return False

        if not to_phone:
            print("[WhatsApp] Warning: No phone number provided for user. Skipping.")
            return False

        message_body = (
            f"📅 *StudySync Calendar Alert*\n\n"
            f"I have successfully scheduled a new event for you!\n\n"
            f"*Event:* {event_title}\n"
            f"*Time:* {event_time}\n\n"
            f"View it on your Google Calendar here:\n{event_link}"
        )

        try:
            async_client = create_async_wasender(api_key=self.api_key)
            async with async_client:
                print(f"[WhatsApp] Sending calendar notification to {to_phone}...")
                response = await async_client.send_text(
                    to=to_phone, 
                    text_body=message_body
                )
                print(f"[WhatsApp] ✓ Calendar message sent successfully: ID {response.response.data.message_id}")
                return True
        except WasenderAPIError as e:
            print(f"[WhatsApp] ✗ API Error sending calendar message: {e.message}")
            return False
        except Exception as e:
            print(f"[WhatsApp] ✗ Unexpected error: {e}")
            return False

whatsapp_service = WhatsAppService()
