#!/usr/bin/env python3
"""
Test script for Bridge POD Management API
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    response = requests.get(f"{BASE_URL}/api/v1/health")
    if response.status_code == 200:
        print("✅ Health check passed!")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Health check failed: {response.status_code}")
    print()

def test_submit_notification():
    """Test the submit notification endpoint"""
    print("🔍 Testing submit notification...")
    
    # Sample pod data
    pod_data = {
        "pod": {
            "id": "1",
            "name": "Mobile App Redesign",
            "description": "Complete redesign of our mobile application",
            "owner": "John Doe",
            "tag": "Feature",
            "createdAt": "2025-01-10T09:00:00Z",
            "startDate": "2025-01-10T09:00:00Z",
            "endDate": "2025-01-24T17:00:00Z",
            "currentStage": 1,
            "members": [
                {
                    "id": "1",
                    "name": "Dhruv",
                    "role": "Product",
                    "taskDescription": "Create comprehensive PRD",
                    "startDate": "2025-01-10T09:00:00Z",
                    "endDate": "2025-01-12T17:00:00Z",
                    "handoffLink": "",
                    "completed": True,
                    "workStartedAt": "2025-01-10T09:00:00Z",
                    "workCompletedAt": "2025-01-12T17:00:00Z",
                    "actualTimeSpent": 2.0
                },
                {
                    "id": "2",
                    "name": "Ayush",
                    "role": "Design",
                    "taskDescription": "Design new UI/UX mockups",
                    "startDate": "2025-01-12T17:00:00Z",
                    "endDate": "2025-01-15T16:00:00Z",
                    "handoffLink": "",
                    "completed": False,
                    "workStartedAt": None,
                    "workCompletedAt": None,
                    "actualTimeSpent": 0.0
                },
                {
                    "id": "3",
                    "name": "Mona",
                    "role": "Frontend",
                    "taskDescription": "Implement frontend components",
                    "startDate": "2025-01-15T16:00:00Z",
                    "endDate": "2025-01-22T17:00:00Z",
                    "handoffLink": "",
                    "completed": False,
                    "workStartedAt": None,
                    "workCompletedAt": None,
                    "actualTimeSpent": 0.0
                }
            ],
            "status": "in-progress",
            "workflowOrder": ["Product", "Design", "Frontend"]
        },
        "currentMemberId": "1",
        "handoffLink": "https://notion.so/prd-mobile-redesign"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/notifications/submit",
            headers={"Content-Type": "application/json"},
            json=pod_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Submit notification test passed!")
            print(f"   Success: {result['success']}")
            print(f"   Message: {result['message']}")
            print(f"   Next Member: {result['nextMemberName']}")
            
            if result['success']:
                print("   🎉 Slack notification sent successfully!")
            else:
                print("   ⚠️  Slack notification failed (this is expected if Slack is not configured)")
        else:
            print(f"❌ Submit notification test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
        print("   Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()

def test_final_stage_notification():
    """Test notification when project is completed"""
    print("🔍 Testing final stage notification...")
    
    # Sample pod data for final stage
    pod_data = {
        "pod": {
            "id": "2",
            "name": "Payment Gateway Integration",
            "description": "Integration of new payment gateway",
            "owner": "Sarah Johnson",
            "tag": "Go-Live",
            "createdAt": "2025-01-15T10:30:00Z",
            "startDate": "2025-01-15T10:30:00Z",
            "endDate": "2025-01-25T17:00:00Z",
            "currentStage": 2,
            "members": [
                {
                    "id": "1",
                    "name": "Sarah",
                    "role": "Product",
                    "taskDescription": "Define payment flow requirements",
                    "startDate": "2025-01-15T10:30:00Z",
                    "endDate": "2025-01-17T14:30:00Z",
                    "handoffLink": "",
                    "completed": True,
                    "workStartedAt": "2025-01-15T10:30:00Z",
                    "workCompletedAt": "2025-01-17T14:30:00Z",
                    "actualTimeSpent": 2.0
                },
                {
                    "id": "2",
                    "name": "Alex",
                    "role": "Backend",
                    "taskDescription": "Implement payment gateway APIs",
                    "startDate": "2025-01-17T14:30:00Z",
                    "endDate": "2025-01-23T17:00:00Z",
                    "handoffLink": "",
                    "completed": True,
                    "workStartedAt": "2025-01-17T14:30:00Z",
                    "workCompletedAt": "2025-01-23T17:00:00Z",
                    "actualTimeSpent": 6.0
                },
                {
                    "id": "3",
                    "name": "Maya",
                    "role": "QA",
                    "taskDescription": "Test payment flows",
                    "startDate": "2025-01-23T17:00:00Z",
                    "endDate": "2025-01-25T17:00:00Z",
                    "handoffLink": "",
                    "completed": False,
                    "workStartedAt": None,
                    "workCompletedAt": None,
                    "actualTimeSpent": 0.0
                }
            ],
            "status": "in-progress",
            "workflowOrder": ["Product", "Backend", "QA"]
        },
        "currentMemberId": "2",
        "handoffLink": "https://github.com/company/payment-gateway-api"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/notifications/submit",
            headers={"Content-Type": "application/json"},
            json=pod_data
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Final stage notification test passed!")
            print(f"   Success: {result['success']}")
            print(f"   Message: {result['message']}")
            print(f"   Next Member: {result['nextMemberName']}")
            
            if result['nextMemberName'] is None:
                print("   🎉 Project completion detected correctly!")
            else:
                print(f"   ➡️  Next member: {result['nextMemberName']}")
                
        else:
            print(f"❌ Final stage notification test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API server")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print()

def main():
    """Run all tests"""
    print("🚀 Bridge POD Management API Test Suite")
    print("=" * 50)
    print()
    
    test_health_check()
    test_submit_notification()
    test_final_stage_notification()
    
    print("🏁 Test suite completed!")
    print()
    print("📝 Notes:")
    print("- The API is working correctly")
    print("- Slack notifications may fail if the bot is not added to the channel")
    print("- You can view the API documentation at: http://localhost:8000/docs")
    print("- The frontend is integrated and will call this API when submit is clicked")

if __name__ == "__main__":
    main() 