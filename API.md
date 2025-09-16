# API Documentation - FitCoach AI

## Overview
The FitCoach AI application provides RESTful APIs for generating personalized fitness plans, tracking progress, and managing user data.

## Base URL
```
https://your-app-name.onrender.com/api
```

## Authentication
Currently using session-based authentication. API key authentication can be added for production use.

## Endpoints

### 1. Generate Fitness Plan
Generate personalized workout and nutrition plans using AI.

**POST** `/api/generate-plan`

#### Request Body
```json
{
  "name": "John Doe",
  "age": 28,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "fitness_level": "intermediate",
  "goals": ["muscle_gain", "strength"],
  "equipment": "commercial_gym",
  "diet_preference": "no_restrictions",
  "workout_time": 45,
  "workout_days": 4,
  "restrictions": "No knee injuries"
}
```

#### Response
```json
{
  "success": true,
  "workout_plan": {
    "name": "Intermediate Strength Program",
    "duration": "45 minutes",
    "frequency": "4 days per week",
    "workouts": [
      {
        "id": 1,
        "name": "Upper Body Strength",
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": "12-15",
            "rest": "60s",
            "instructions": "Keep core tight"
          }
        ]
      }
    ]
  },
  "diet_plan": {
    "daily_calories": 2200,
    "macros": {
      "protein": "30%",
      "carbs": "40%",
      "fats": "30%"
    },
    "meals": [
      {
        "meal": "Breakfast",
        "options": [
          {
            "name": "Protein Oatmeal",
            "calories": 350,
            "protein": "25g"
          }
        ]
      }
    ]
  },
  "user_id": "user_123"
}
```

### 2. AI Chat
Get fitness advice and answers from the AI coach.

**POST** `/api/chat`

#### Request Body
```json
{
  "question": "How many sets should I do for muscle growth?",
  "user_id": "user_123"
}
```

#### Response
```json
{
  "success": true,
  "response": "For muscle growth (hypertrophy), aim for 3-4 sets per exercise. This rep range allows for sufficient volume while maintaining good form. Focus on 8-12 reps per set with moderate to heavy weight."
}
```

### 3. Log Progress
Track user progress and workout completions.

**POST** `/api/log-progress`

#### Request Body
```json
{
  "user_id": "user_123",
  "type": "workout",
  "value": {
    "workout_name": "Upper Body Strength",
    "duration": 45,
    "exercises_completed": 8,
    "notes": "Great session!"
  },
  "date": "2025-01-15T10:30:00Z"
}
```

#### Response
```json
{
  "success": true,
  "message": "Progress logged successfully"
}
```

### 4. Export Data
Export all user data in JSON format.

**GET** `/api/export-data/{user_id}`

#### Response
Downloads a JSON file containing:
- User profile data
- Workout plans
- Meal plans  
- Progress history
- Achievements

## Error Handling

### Error Response Format
```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### HTTP Status Codes
- `200 OK` - Success
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user
- AI generation limited to 10 requests per hour

## Data Models

### User Profile
```json
{
  "name": "string",
  "age": "integer",
  "gender": "string",
  "height": "number",
  "weight": "number",
  "fitness_level": "string",
  "goals": ["string"],
  "equipment": "string",
  "diet_preference": "string",
  "restrictions": "string"
}
```

### Exercise
```json
{
  "name": "string",
  "sets": "integer",
  "reps": "string",
  "rest": "string",
  "instructions": "string",
  "muscle_groups": ["string"],
  "difficulty": "string"
}
```

### Meal
```json
{
  "name": "string",
  "calories": "integer",
  "protein": "string",
  "carbs": "string",
  "fat": "string",
  "ingredients": ["string"],
  "instructions": "string"
}
```

## SDKs and Examples

### JavaScript/Node.js
```javascript
const response = await fetch('/api/generate-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    age: 28,
    fitness_level: 'intermediate'
    // ... other fields
  })
});

const data = await response.json();
console.log(data);
```

### Python
```python
import requests

response = requests.post('/api/generate-plan', json={
    'name': 'John Doe',
    'age': 28,
    'fitness_level': 'intermediate'
    # ... other fields
})

data = response.json()
print(data)
```

### cURL
```bash
curl -X POST /api/generate-plan   -H "Content-Type: application/json"   -d '{
    "name": "John Doe",
    "age": 28,
    "fitness_level": "intermediate"
  }'
```

## Webhooks
Configure webhooks to receive notifications about:
- Plan generation completion
- Progress milestones
- Achievement unlocks

## Security
- All API endpoints use HTTPS
- Input validation and sanitization
- SQL injection protection
- Rate limiting implemented
- CORS configured for web applications
