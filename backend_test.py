import requests
import sys
import json
from datetime import datetime, timezone, timedelta

class TrailMeetAPITester:
    def __init__(self, base_url="https://eventtracker-3.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_base}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_api_health(self):
        """Test API health endpoint"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_demo_authentication(self):
        """Test demo authentication"""
        success, response = self.run_test(
            "Demo Authentication",
            "POST",
            "auth/session",
            200
        )
        
        if success and 'session_token' in response:
            self.token = response['session_token']
            self.user_id = response.get('id')
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_get_user_profile(self):
        """Test getting current user profile"""
        if not self.token:
            self.log_test("Get User Profile", False, "No authentication token")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_events(self):
        """Test getting all events"""
        success, response = self.run_test(
            "Get All Events",
            "GET",
            "events",
            200
        )
        
        if success:
            events_count = len(response) if isinstance(response, list) else 0
            print(f"   Found {events_count} events")
        
        return success

    def test_create_event(self):
        """Test creating a new event"""
        if not self.token:
            self.log_test("Create Event", False, "No authentication token")
            return False, None

        # Create event data
        future_date = datetime.now(timezone.utc) + timedelta(days=7)
        event_data = {
            "title": "Test Hiking Event",
            "description": "A test hiking event for API testing",
            "event_type": "hiking",
            "location": {
                "lat": 19.0760,
                "lng": 72.8777,
                "address": "Mumbai, Maharashtra, India"
            },
            "event_date": future_date.isoformat(),
            "capacity": 10
        }

        success, response = self.run_test(
            "Create Event",
            "POST",
            "events",
            200,
            data=event_data
        )
        
        if success and 'id' in response:
            print(f"   Event created with ID: {response['id']}")
            return True, response['id']
        
        return False, None

    def test_get_specific_event(self, event_id):
        """Test getting a specific event by ID"""
        if not event_id:
            self.log_test("Get Specific Event", False, "No event ID provided")
            return False
            
        success, response = self.run_test(
            "Get Specific Event",
            "GET",
            f"events/{event_id}",
            200
        )
        return success

    def test_join_event(self, event_id):
        """Test joining an event"""
        if not event_id or not self.token:
            self.log_test("Join Event", False, "Missing event ID or token")
            return False
            
        success, response = self.run_test(
            "Join Event",
            "POST",
            f"events/{event_id}/join",
            200
        )
        return success

    def test_leave_event(self, event_id):
        """Test leaving an event"""
        if not event_id or not self.token:
            self.log_test("Leave Event", False, "Missing event ID or token")
            return False
            
        success, response = self.run_test(
            "Leave Event",
            "DELETE",
            f"events/{event_id}/leave",
            200
        )
        return success

    def test_get_my_events(self):
        """Test getting user's events"""
        if not self.token:
            self.log_test("Get My Events", False, "No authentication token")
            return False
            
        success, response = self.run_test(
            "Get My Events",
            "GET",
            "my-events",
            200
        )
        return success

    def test_chat_functionality(self, event_id):
        """Test chat functionality for an event"""
        if not event_id or not self.token:
            self.log_test("Chat - Get Messages", False, "Missing event ID or token")
            return False

        # Test getting chat messages
        success1, response1 = self.run_test(
            "Chat - Get Messages",
            "GET",
            f"events/{event_id}/chat",
            200
        )

        # Test sending a chat message
        message_data = {
            "message": "Test message from API testing"
        }
        
        success2, response2 = self.run_test(
            "Chat - Send Message",
            "POST",
            f"events/{event_id}/chat",
            200,
            data=message_data
        )

        return success1 and success2

    def test_logout(self):
        """Test user logout"""
        if not self.token:
            self.log_test("Logout", False, "No authentication token")
            return False
            
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        
        if success:
            self.token = None
            self.user_id = None
        
        return success

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting TrailMeet API Tests")
        print("=" * 50)

        # Test API health
        if not self.test_api_health():
            print("❌ API is not responding. Stopping tests.")
            return False

        # Test authentication
        if not self.test_demo_authentication():
            print("❌ Authentication failed. Stopping tests.")
            return False

        # Test user profile
        self.test_get_user_profile()

        # Test events
        self.test_get_events()

        # Test event creation and management
        event_created, event_id = self.test_create_event()
        
        if event_created and event_id:
            self.test_get_specific_event(event_id)
            self.test_join_event(event_id)
            self.test_chat_functionality(event_id)
            self.test_leave_event(event_id)

        # Test user's events
        self.test_get_my_events()

        # Test logout
        self.test_logout()

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.tests_run - self.tests_passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['details']}")

        return self.tests_passed == self.tests_run

def main():
    tester = TrailMeetAPITester()
    
    try:
        success = tester.run_all_tests()
        tester.print_summary()
        
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())