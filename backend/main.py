from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import jwt
from datetime import datetime, timedelta
import uvicorn

app = FastAPI(title="Job Management API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
JWT_SECRET = "your-secret-key"
JWT_ALGORITHM = "HS256"

# Security
security = HTTPBearer()

# Mock data
file_sensing_jobs = [
    {
        "id": 1,
        "jobName": "Customer Data Import",
        "schedule": "0 6 * * *",
        "serverName": "prod-server-01",
        "fileLocation": "/data/imports/customers",
        "filePattern": "customer_*.csv",
        "lastSuccessfulAttempt": "2025-01-07T06:00:15",
        "lastSensingAttempt": "2025-01-07T06:00:15",
        "status": "running"
    },
    {
        "id": 2,
        "jobName": "Order Processing",
        "schedule": "*/15 * * * *",
        "serverName": "prod-server-02",
        "fileLocation": "/data/orders",
        "filePattern": "orders_*.json",
        "lastSuccessfulAttempt": "2025-01-07T14:15:00",
        "lastSensingAttempt": "2025-01-07T14:30:00",
        "status": "failed"
    },
    {
        "id": 3,
        "jobName": "Inventory Updates",
        "schedule": "0 */2 * * *",
        "serverName": "prod-server-03",
        "fileLocation": "/data/inventory",
        "filePattern": "inventory_*.xml",
        "lastSuccessfulAttempt": "2025-01-07T12:00:00",
        "lastSensingAttempt": "2025-01-07T14:00:00",
        "status": "paused"
    }
]

filtering_jobs = [
    {
        "id": 1,
        "jobName": "Email Sanitization",
        "schedule": "0 */4 * * *",
        "serverName": "filter-server-01",
        "fileLocation": "/data/emails",
        "filePattern": "emails_*.txt",
        "lastSuccessfulAttempt": "2025-01-07T12:00:00",
        "lastSensingAttempt": "2025-01-07T16:00:00",
        "status": "running"
    },
    {
        "id": 2,
        "jobName": "Log Cleaning",
        "schedule": "0 2 * * *",
        "serverName": "filter-server-02",
        "fileLocation": "/logs/application",
        "filePattern": "app_*.log",
        "lastSuccessfulAttempt": "2025-01-07T02:00:00",
        "lastSensingAttempt": "2025-01-07T02:00:00",
        "status": "running"
    }
]

# Mock users for SSO
mock_users = {
    "admin@company.com": {"id": 1, "email": "admin@company.com", "name": "Admin User", "hasAccess": True},
    "user@company.com": {"id": 2, "email": "user@company.com", "name": "Regular User", "hasAccess": True},
    "noaccess@company.com": {"id": 3, "email": "noaccess@company.com", "name": "No Access User", "hasAccess": False}
}

# Pydantic models
class JobCreate(BaseModel):
    jobName: str
    schedule: str
    serverName: str
    fileLocation: str
    filePattern: str

class Job(BaseModel):
    id: int
    jobName: str
    schedule: str
    serverName: str
    fileLocation: str
    filePattern: str
    lastSuccessfulAttempt: Optional[str]
    lastSensingAttempt: Optional[str]
    status: str

class DashboardStats(BaseModel):
    total: int
    running: int
    failed: int
    paused: int
    lastSuccessfulRun: Optional[str]
    averageSuccessRate: float

class SSORequest(BaseModel):
    token: str

class User(BaseModel):
    id: int
    email: str
    name: str
    hasAccess: bool

# Custom SSO function
def verify_sso_token(token: str) -> dict:
    """
    Custom SSO verification function
    In a real implementation, this would validate the token with your SSO provider
    """
    try:
        # For demo purposes, we'll create a mock token validation
        # In reality, you'd validate with your SSO provider (SAML, OIDC, etc.)
        
        # Mock validation - in real implementation, validate with SSO provider
        if token == "mock-sso-token-admin":
            return {"email": "admin@company.com", "name": "Admin User"}
        elif token == "mock-sso-token-user":
            return {"email": "user@company.com", "name": "Regular User"}
        elif token == "mock-sso-token-noaccess":
            return {"email": "noaccess@company.com", "name": "No Access User"}
        else:
            raise HTTPException(status_code=401, detail="Invalid SSO token")
    except Exception:
        raise HTTPException(status_code=401, detail="SSO token validation failed")

# Authentication dependency
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = mock_users.get(email)
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Check access dependency
def check_access(user: dict = Depends(get_current_user)):
    if not user.get("hasAccess"):
        raise HTTPException(status_code=403, detail="Access denied")
    return user

# Auth routes
@app.post("/api/auth/sso-login")
async def sso_login(sso_request: SSORequest):
    """
    SSO login endpoint that accepts an SSO token and returns a JWT
    """
    try:
        # Verify SSO token with custom function
        sso_user_data = verify_sso_token(sso_request.token)
        
        # Get user from our system
        user = mock_users.get(sso_user_data["email"])
        if not user:
            raise HTTPException(status_code=401, detail="User not found in system")
        
        # Create JWT token
        token_data = {
            "email": user["email"],
            "exp": datetime.utcnow() + timedelta(hours=24)
        }
        token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        return {
            "token": token,
            "user": user
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SSO login failed: {str(e)}")

@app.get("/api/auth/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    return {"user": user}

# Dashboard stats
@app.get("/api/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(user: dict = Depends(check_access)):
    all_jobs = file_sensing_jobs + filtering_jobs
    
    stats = DashboardStats(
        total=len(all_jobs),
        running=len([job for job in all_jobs if job["status"] == "running"]),
        failed=len([job for job in all_jobs if job["status"] == "failed"]),
        paused=len([job for job in all_jobs if job["status"] == "paused"]),
        lastSuccessfulRun=max([job["lastSuccessfulAttempt"] for job in all_jobs if job["lastSuccessfulAttempt"]], default=None),
        averageSuccessRate=85.7
    )
    
    return stats

# File Sensing Jobs routes
@app.get("/api/file-sensing/jobs", response_model=List[Job])
async def get_file_sensing_jobs(user: dict = Depends(check_access)):
    return file_sensing_jobs

@app.post("/api/file-sensing/jobs", response_model=Job)
async def create_file_sensing_job(job: JobCreate, user: dict = Depends(check_access)):
    new_job = {
        "id": len(file_sensing_jobs) + 1,
        **job.dict(),
        "lastSuccessfulAttempt": None,
        "lastSensingAttempt": None,
        "status": "running"
    }
    file_sensing_jobs.append(new_job)
    return new_job

@app.post("/api/file-sensing/jobs/{job_id}/toggle", response_model=Job)
async def toggle_file_sensing_job(job_id: int, user: dict = Depends(check_access)):
    job = next((j for j in file_sensing_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job["status"] = "running" if job["status"] == "paused" else "paused"
    return job

# Character Filtering Jobs routes
@app.get("/api/filtering/jobs", response_model=List[Job])
async def get_filtering_jobs(user: dict = Depends(check_access)):
    return filtering_jobs

@app.post("/api/filtering/jobs", response_model=Job)
async def create_filtering_job(job: JobCreate, user: dict = Depends(check_access)):
    new_job = {
        "id": len(filtering_jobs) + 1,
        **job.dict(),
        "lastSuccessfulAttempt": None,
        "lastSensingAttempt": None,
        "status": "running"
    }
    filtering_jobs.append(new_job)
    return new_job

@app.post("/api/filtering/jobs/{job_id}/toggle", response_model=Job)
async def toggle_filtering_job(job_id: int, user: dict = Depends(check_access)):
    job = next((j for j in filtering_jobs if j["id"] == job_id), None)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job["status"] = "running" if job["status"] == "paused" else "paused"
    return job

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)