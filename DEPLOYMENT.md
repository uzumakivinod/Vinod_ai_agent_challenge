# Deployment Guide - FitCoach AI

## Quick Deployment to Render (Free)

### 1. Prerequisites
- GitHub account
- Render account (free)
- DeepSeek API key

### 2. Setup Repository
1. Create a new GitHub repository
2. Upload all project files to the repository
3. Ensure these files are in the root directory:
   - `app.py` (main Flask application)
   - `requirements.txt` (dependencies)
   - `Procfile` (deployment configuration)
   - `runtime.txt` (Python version)

### 3. Deploy to Render

#### Step 1: Connect Repository
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub account and select the repository

#### Step 2: Configure Service
- **Name**: `fitcoach-ai` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

#### Step 3: Set Environment Variables
Add these environment variables in Render dashboard:
```
DEEPSEEK_API_KEY=your_deepseek_api_key_here
SECRET_KEY=your_random_secret_key
FLASK_ENV=production
PORT=10000
```

#### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Your app will be available at: `https://your-app-name.onrender.com`

### 4. Get DeepSeek API Key

1. Go to [DeepSeek Platform](https://platform.deepseek.com)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your environment variables

**Note**: DeepSeek offers free API credits for new users!

## Alternative Deployment Platforms

### Railway (Free Tier)
1. Connect GitHub repository to Railway
2. Set environment variables
3. Deploy automatically

### Heroku (Paid)
1. Create Heroku app
2. Connect GitHub repository
3. Add environment variables in Heroku dashboard
4. Enable automatic deployments

### PythonAnywhere (Free Tier)
1. Upload files to PythonAnywhere
2. Configure WSGI file
3. Set up web app configuration

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DEEPSEEK_API_KEY` | Your DeepSeek API key for AI features | Yes |
| `SECRET_KEY` | Flask secret key for sessions | Yes |
| `FLASK_ENV` | Set to 'production' for deployment | Yes |
| `PORT` | Port number (usually set by platform) | No |
| `DATABASE_URL` | Database connection string | No |

## Troubleshooting

### Common Issues

**Build Fails**
- Check `requirements.txt` for correct package versions
- Ensure Python version matches `runtime.txt`
- Verify all files are properly uploaded

**App Won't Start**
- Check environment variables are set correctly
- Review logs in Render dashboard
- Ensure `Procfile` has correct start command

**API Errors**
- Verify DeepSeek API key is valid
- Check API key has sufficient credits
- Review API endpoint URLs

### Support
- Check Render documentation: [render.com/docs](https://render.com/docs)
- Review Flask deployment guides
- Contact support through platform help centers

## Next Steps
1. Set up custom domain (optional)
2. Configure SSL certificate (usually automatic)
3. Set up monitoring and analytics
4. Scale based on usage
