#!/usr/bin/env python3
"""
List available Slack channels
"""

import requests

# Slack configuration
import os
SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN")

def list_channels():
    """List available channels"""
    print("🔍 Listing available channels...")
    
    url = "https://slack.com/api/conversations.list"
    headers = {
        "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
        "Content-Type": "application/json"
    }
    
    params = {
        "types": "public_channel,private_channel",
        "limit": 100
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        result = response.json()
        
        if result.get("ok"):
            channels = result.get("channels", [])
            print(f"✅ Found {len(channels)} channels:")
            print()
            
            for channel in channels:
                channel_type = "🔒 Private" if channel.get("is_private") else "🌐 Public"
                print(f"   {channel_type} | #{channel.get('name')} | ID: {channel.get('id')}")
                
        else:
            print(f"❌ Failed to list channels: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")

if __name__ == "__main__":
    print("🚀 Slack Channel Lister")
    print("=" * 50)
    list_channels()
    print("\n🏁 Complete!") 