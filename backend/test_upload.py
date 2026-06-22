import requests
import json

# We need a valid token. Let's get one by logging in as Rohan Deshmukh
# Wait, I don't know the password. I can bypass auth by hitting the backend directly if I mock the dependency.
# Actually, I can just create a small base64 string and see if we get 401, 422, or 500!
url = "http://127.0.0.1:8000/employee-portal/profile/upload-dp"
payload = {
    "file": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/"
}
headers = {
    'Content-Type': 'application/json'
    # Without Authorization header
}

response = requests.post(url, json=payload, headers=headers)
print("Status Code:", response.status_code)
print("Response:", response.text)
