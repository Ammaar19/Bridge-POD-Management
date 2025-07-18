# Bridge Project Handoff Tool - Backend

A FastAPI backend for the Bridge Project Handoff Tool with Slack integration for real-time notifications.

## Features

- **Pod Management**: Create, read, update, and delete project pods
- **Task Management**: Manage tasks within pods with different types (PRD, Design, Development, ML/AI, QA, Go Live)
- **Employee Management**: Manage team members and their roles
- **Review System**: Track task reviews with approval workflows
- **Slack Integration**: Real-time notifications for task assignments, completions, and reviews
- **WebSocket Support**: Real-time updates to the frontend
- **RESTful API**: Complete CRUD operations for all entities

## Tech Stack

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **SQLite**: Database (can be easily changed to PostgreSQL)
- **Slack SDK**: Slack integration for notifications
- **WebSockets**: Real-time communication
- **Pydantic**: Data validation and settings management
- **uv**: Fast Python package installer and resolver

## Installation

1. **Install dependencies**:
   ```bash
   uv sync
   ```

2. **Set up environment variables**:
   Create a `.env` file in the backend directory:
   ```env
   # Database Configuration
   DATABASE_URL=sqlite:///./bridge.db
   
   # Slack Configuration
   SLACK_BOT_TOKEN=your-slack-bot-token-here
   SLACK_SIGNING_SECRET=your-slack-signing-secret-here
   SLACK_CHANNEL_ID=#general
   
   # Security
   SECRET_KEY=your-secret-key-change-this-in-production
   
   # API Configuration
   API_V1_STR=/api/v1
   ```

3. **Run the application**:
   ```bash
   uv run python main.py
   ```

   Or with uvicorn directly:
   ```bash
   uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Pods
- `GET /api/v1/pods/` - Get all pods
- `GET /api/v1/pods/{pod_id}` - Get specific pod with tasks
- `POST /api/v1/pods/` - Create new pod
- `PUT /api/v1/pods/{pod_id}` - Update pod
- `DELETE /api/v1/pods/{pod_id}` - Delete pod

### Tasks
- `GET /api/v1/tasks/` - Get all tasks (with optional pod filtering)
- `GET /api/v1/tasks/{task_id}` - Get specific task with reviews
- `POST /api/v1/tasks/` - Create new task
- `PUT /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task
- `POST /api/v1/tasks/{task_id}/assign` - Assign task to someone

### Employees
- `GET /api/v1/employees/` - Get all employees
- `GET /api/v1/employees/{employee_id}` - Get specific employee
- `POST /api/v1/employees/` - Create new employee
- `PUT /api/v1/employees/{employee_id}` - Update employee
- `DELETE /api/v1/employees/{employee_id}` - Soft delete employee
- `GET /api/v1/employees/search/` - Search employees

### Reviews
- `GET /api/v1/reviews/` - Get all reviews (with optional filtering)
- `GET /api/v1/reviews/{review_id}` - Get specific review
- `POST /api/v1/reviews/` - Create new review
- `PUT /api/v1/reviews/{review_id}` - Update review
- `DELETE /api/v1/reviews/{review_id}` - Delete review
- `POST /api/v1/reviews/{review_id}/complete` - Mark review as completed

### WebSocket
- `WS /api/v1/ws` - WebSocket endpoint for real-time updates

## Database Models

### Pod
- `id`: Primary key
- `name`: Pod name
- `owner`: Pod owner
- `description`: Optional description
- `is_feature`: Boolean flag for feature pods
- `is_requirement`: Boolean flag for requirement pods
- `status`: Pod status (active, completed, archived)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Task
- `id`: Primary key
- `pod_id`: Foreign key to Pod
- `task_type`: Task type (PRD, Design, Development, ML/AI, QA, Go Live)
- `title`: Task title
- `description`: Task description
- `assignee`: Task assignee
- `reviewer`: Task reviewer
- `status`: Task status (pending, in_progress, review, completed, blocked)
- `prd_link`: Link to PRD
- `pr_link`: Link to PR
- `figma_link`: Link to Figma
- `other_links`: Additional links (JSON)
- `start_date`: Task start date
- `end_date`: Task end date
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Employee
- `id`: Primary key
- `name`: Employee name
- `email`: Employee email (unique)
- `slack_id`: Slack user ID
- `role`: Employee role
- `department`: Employee department
- `is_active`: Active status
- `skills`: Skills (JSON)
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### Review
- `id`: Primary key
- `task_id`: Foreign key to Task
- `reviewer_id`: Foreign key to Employee
- `status`: Review status (pending, in_progress, approved, rejected, completed)
- `comments`: Review comments
- `feedback`: Review feedback
- `is_completed`: Completion flag
- `completed_at`: Completion timestamp
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Slack Integration

The backend sends Slack notifications for:
- New pod creation
- Task assignments
- Task completions
- Review requests
- Review completions

To set up Slack integration:
1. Create a Slack app in your workspace
2. Get the bot token and signing secret
3. Add the bot to your desired channel
4. Update the `.env` file with your Slack credentials

## Development

### Running in Development Mode
```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### API Documentation
Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Database Migrations
The application uses SQLAlchemy with automatic table creation. For production, consider using Alembic for migrations.

## Production Deployment

For production deployment:
1. Use a production database (PostgreSQL recommended)
2. Set proper environment variables
3. Use a production ASGI server (Gunicorn with Uvicorn workers)
4. Set up proper CORS origins
5. Use HTTPS
6. Set up proper logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
