import requests
import json

response = requests.post('http://127.0.0.1:8000/api/auth/login', data={'username': 'hemanth@nsg.com', 'password': 'password123'})
token = response.json().get('access_token')

headers = {'Authorization': f'Bearer {token}'}
res = requests.get('http://127.0.0.1:8000/api/employee-portal/payroll/my-payslips', headers=headers)
data = res.json()
for item in data.get('items', []):
    print(f"ID: {item.get('id')}, Has HTML: {bool(item.get('custom_payslip_html'))}")
