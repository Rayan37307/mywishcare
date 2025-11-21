import requests
import json

# The URL of the API endpoint (replace with the actual endpoint you are sending data to)
url = "https://wishcarebd.com"

# The data you're sending (same as provided)
payload = {
    "data": [
        {
            "event_name": "Purchase",
            "event_time": 1678886400,
            "user_data": {
                "email": "test@example.com"
            },
            "custom_data": {
                "value": 100.00,
                "currency": "USD"
            },
            "test_event_code": "TEST39893"  # Include the copied test event code here
        }
    ]
}

# The headers (if required, like for JSON format)
headers = {
    "Content-Type": "application/json"
}

# Make the API call
response = requests.post(url, json=payload, headers=headers)

# Check the response status and print result
if response.status_code == 200:
    print("Request was successful")
    print(response.json())  # Print the JSON response from the API
else:
    print(f"Failed to make the request. Status code: {response.status_code}")
    print(response.text)  # Print error response
