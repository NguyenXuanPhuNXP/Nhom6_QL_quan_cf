# Employee & Position Management API

Backend API endpoints for managing employees and positions with complete CRUD operations.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints (except `/auth/login`) require Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/employees
```

Token is obtained from login endpoint and valid for 24 hours.

## Authorization

- **GET endpoints**: Requires authentication (any logged-in user)
- **POST/PUT/DELETE endpoints**: Requires Admin role only

## Endpoints

### Employees

#### GET /employees
List all employees
```bash
curl http://localhost:3000/api/employees
```
Response:
```json
[
  {
    "employee_id": 2,
    "full_name": "Nguyễn Văn An",
    "gender": "Nam",
    "phone": "0901234567",
    "address": "123 Lê Lợi",
    "position_id": 1,
    "position_name": "Quản lý",
    "salary_rate": 50000,
    "created_at": "2026-06-23T11:48:55.000Z"
  }
]
```

#### GET /employees/:id
Get employee by ID
```bash
curl http://localhost:3000/api/employees/2
```

#### POST /employees
Create new employee
```bash
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn An",
    "gender": "Nam",
    "phone": "0901234567",
    "address": "123 Lê Lợi",
    "position_id": 1,
    "salary_rate": 50000
  }'
```
Required fields:
- `full_name` (string, required)
- `position_id` (integer, required)

Optional fields:
- `gender` (string)
- `phone` (string)
- `address` (string)
- `salary_rate` (number)

#### PUT /employees/:id
Update employee
```bash
curl -X PUT http://localhost:3000/api/employees/2 \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn An Updated",
    "phone": "0912345678"
  }'
```
All fields are optional, only provided fields will be updated.

#### DELETE /employees/:id
Delete employee
```bash
curl -X DELETE http://localhost:3000/api/employees/2
```

### Positions

#### GET /positions
List all positions
```bash
curl http://localhost:3000/api/positions
```

#### GET /positions/:id
Get position by ID
```bash
curl http://localhost:3000/api/positions/1
```

#### POST /positions
Create new position
```bash
curl -X POST http://localhost:3000/api/positions \
  -H "Content-Type: application/json" \
  -d '{
    "position_name": "Quản lý"
  }'
```
Required fields:
- `position_name` (string, required)

#### PUT /positions/:id
Update position
```bash
curl -X PUT http://localhost:3000/api/positions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "position_name": "Quản lý Khu vực"
  }'
```

#### DELETE /positions/:id
Delete position
```bash
curl -X DELETE http://localhost:3000/api/positions/1
```

## Error Responses

All errors return with appropriate HTTP status codes:
- `400` - Bad request (missing required fields, invalid position_id)
- `404` - Not found (employee/position doesn't exist)
- `500` - Server error

Example error response:
```json
{
  "message": "Không tìm thấy nhân viên"
}
```

## Testing with PowerShell

```powershell
# Create position
$body = @{ position_name = "Quản lý" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/positions" -Method POST -Body $body -ContentType "application/json"

# Create employee
$body = @{ 
  full_name = "Nguyễn Văn An"
  phone = "0901234567"
  address = "123 Lê Lợi"
  position_id = 1
  salary_rate = 50000 
} | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/employees" -Method POST -Body $body -ContentType "application/json"

# Get all employees
Invoke-WebRequest -Uri "http://localhost:3000/api/employees" | Select-Object -ExpandProperty Content

# Update employee
$body = @{ full_name = "Updated Name" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/employees/2" -Method PUT -Body $body -ContentType "application/json"

# Delete employee
Invoke-WebRequest -Uri "http://localhost:3000/api/employees/2" -Method DELETE
```

## Files Created

- `BackEnd/src/controllers/employeeController.js` - Employee CRUD logic
- `BackEnd/src/controllers/positionController.js` - Position CRUD logic
- `BackEnd/src/routes/employeeRoutes.js` - Employee routes
- `BackEnd/src/routes/positionRoutes.js` - Position routes
- `BackEnd/server.js` - Updated with CORS and new routes

## Notes

- Positions must exist before creating employees (foreign key constraint)
- Gender column may need charset adjustment in database
- All timestamps in UTC format
- Base64 support for avatar uploads (limit: 5MB JSON payload)
