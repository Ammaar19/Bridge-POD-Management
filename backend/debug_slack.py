#!/usr/bin/env python3
"""
Debug script to test Slack API directly
"""

import requests
import json

# Slack configuration
import os
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_CHANNEL_ID = os.getenv("SLACK_CHANNEL_ID", "#general")

def test_slack_api():
    """Test Slack API directly"""
    print("🔍 Testing Slack API directly...")
    
    url = "https://slack.com/api/chat.postMessage"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "channel": SLACK_CHANNEL_ID,
        "text": "🧪 Test message from Bridge POD Bot",
        "username": "Bridge POD Bot",
        "icon_emoji": ":bridge:"
    }
    
    print(f"📤 Sending request to Slack...")
    print(f"   URL: {url}")
    print(f"   Channel: {SLACK_CHANNEL_ID}")
    print(f"   Token: {SLACK_BOT_TOKEN[:20]}...")
    print(f"   Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"📥 Response Status: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        
        result = response.json()
        print(f"📥 Response Body: {json.dumps(result, indent=2)}")
        
        if result.get("ok"):
            print("✅ Slack API call successful!")
            print(f"   Message sent to channel: {result.get('channel')}")
            print(f"   Message timestamp: {result.get('ts')}")
        else:
            print("❌ Slack API call failed!")
            print(f"   Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

def test_slack_auth():
    """Test Slack authentication"""
    print("\n🔍 Testing Slack authentication...")
    
    url = "https://slack.com/api/auth.test"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, headers=headers)
        result = response.json()
        
        print(f"📥 Auth Test Response: {json.dumps(result, indent=2)}")
        
        if result.get("ok"):
            print("✅ Authentication successful!")
            print(f"   User ID: {result.get('user_id')}")
            print(f"   Team: {result.get('team')}")
            print(f"   Bot ID: {result.get('bot_id')}")
        else:
            print("❌ Authentication failed!")
            print(f"   Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

def test_channel_info():
    """Test getting channel info"""
    print("\n🔍 Testing channel info...")
    
    url = "https://slack.com/api/conversations.info"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    params = {
        "channel": SLACK_CHANNEL_ID
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        print(f"📥 Channel Info Response: {json.dumps(result, indent=2)}")
        
        if result.get("ok"):
            channel = result.get("channel", {})
            print("✅ Channel info retrieved!")
            print(f"   Channel Name: {channel.get('name')}")
            print(f"   Channel Type: {channel.get('is_private') and 'Private' or 'Public'}")
            print(f"   Member Count: {channel.get('num_members')}")
        else:
            print("❌ Failed to get channel info!")
            print(f"   Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    print("🚀 Slack API Debug Tool")
    print("=" * 50)
    
    test_slack_auth()
    test_channel_info()
    test_slack_api()
    
    print("\n🏁 Debug complete!") 