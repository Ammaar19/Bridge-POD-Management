from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import requests
from datetime import datetime
import json

app = FastAPI(title="Bridge POD Management API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Slack configuration
# Note: You need a Bot User OAuth Token (xoxb-...) not an App-Level Token (xapp-...)
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID", "#general")  # You can change this to your desired channel
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")

# Pydantic models
class PodMember(BaseModel):
    id: str
    name: str
    role: str
    taskDescription: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    handoffLink: str = ""
    completed: bool = False
    workStartedAt: Optional[str] = None
    workCompletedAt: Optional[str] = None
    actualTimeSpent: float = 0

class Pod(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    owner: Optional[str] = None
    tag: Optional[str] = None
    createdAt: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    currentStage: int
    members: List[PodMember]
    status: str
    workflowOrder: List[str]

class SubmitNotificationRequest(BaseModel):
    pod: Pod
    currentMemberId: str
    handoffLink: str

class SlackNotificationResponse(BaseModel):
    success: bool
    message: str
    nextMemberName: Optional[str] = None

def send_slack_notification(message: str) -> bool:
    """Send a notification to Slack channel"""
    # TEMPORARY: For testing without Slack, uncomment the next line
    # return True  # Mock success response
    
    try:
        url = "https://slack.com/api/chat.postMessage"
        headers = {
            "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "channel": SLACK_CHANNEL_ID,
            "text": message,
            "username": "Bridge POD Bot",
            "icon_emoji": ":bridge:"
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"Slack API Response: {result}")  # Debug: Print full response
        if not result.get("ok"):
            print(f"Slack API error: {result.get('error')}")
            return False
            
        return True
    except Exception as e:
        print(f"Error sending Slack notification: {e}")
        return False

def get_next_member(pod: Pod, currentMemberId: str) -> Optional[PodMember]:
    """Get the next member in the workflow after the current member"""
    try:
        # Find current member index
        current_index = None
        for i, member in enumerate(pod.members):
            if member.id == currentMemberId:
                current_index = i
                break
        
        if current_index is None:
            return None
            
        # Get next member
        next_index = current_index + 1
        if next_index < len(pod.members):
            return pod.members[next_index]
            
        return None
    except Exception as e:
        print(f"Error getting next member: {e}")
        return None

@app.post("/api/v1/notifications/submit", response_model=SlackNotificationResponse)
async def handle_submit_notification(request: SubmitNotificationRequest):
    """
    Handle submit button click and send Slack notification
    """
    try:
        # Get current member
        current_member = None
        for member in request.pod.members:
            if member.id == request.currentMemberId:
                current_member = member
                break
                
        if not current_member:
            raise HTTPException(status_code=404, detail="Current member not found")
            
        # Get next member in workflow
        next_member = get_next_member(request.pod, request.currentMemberId)
        
        # Create notification message
        if next_member:
            message = f"""
:white_check_mark: *Task Completed - Handoff Ready*

*Project:* {request.pod.name}
*Completed by:* {current_member.name} ({current_member.role})
*Handoff Link:* {request.handoffLink}

:arrow_right: *Next in line:* {next_member.name} ({next_member.role})
*Status:* Pending handoff to {next_member.name}

Please review the handoff link and proceed with your tasks.
            """.strip()
        else:
            message = f"""
:white_check_mark: *Project Completed!*

*Project:* {request.pod.name}
*Completed by:* {current_member.name} ({current_member.role})
*Handoff Link:* {request.handoffLink}

:tada: *Status:* All stages completed successfully!

This project has been fully completed by the team.
            """.strip()
        
        # Send Slack notification
        success = send_slack_notification(message)
        
        if success:
            return SlackNotificationResponse(
                success=True,
                message="Slack notification sent successfully",
                nextMemberName=next_member.name if next_member else None
            )
        else:
            return SlackNotificationResponse(
                success=False,
                message="Failed to send Slack notification",
                nextMemberName=next_member.name if next_member else None
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Bridge POD Management API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 