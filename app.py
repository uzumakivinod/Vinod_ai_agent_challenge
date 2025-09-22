from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
import requests
from io import BytesIO
import logging
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration - FIXED: Use OPENROUTER_API_KEY instead of DEEPSEEK_API_KEY
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fitness-coach-ai-secret-key-2025')
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

# In-memory storage (replace with actual database in production)
users_db = {}
workouts_db = {}
meals_db = {}
progress_db = {}

class FitnessAI:
    """
    AI-powered fitness coach that generates personalized workout and diet plans
    using OpenRouter API (DeepSeek R1 Free) and LangChain for context management
    """

    def __init__(self, api_key):
        self.api_key = api_key
        # FIXED: Use OpenRouter URL instead of DeepSeek URL
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    def create_workout_prompt(self, user_data):
        """Create optimized prompt for workout plan generation"""
        prompt = f"""
You are a certified personal trainer and fitness expert. Create a personalized workout plan for:

User Profile:
- Age: {user_data.get('age', 'Not specified')}
- Gender: {user_data.get('gender', 'Not specified')}
- Fitness Level: {user_data.get('fitness_level', 'Beginner')}
- Goals: {user_data.get('goals', 'General fitness')}
- Available Time: {user_data.get('workout_time', '30 minutes')} per day
- Equipment: {user_data.get('equipment', 'Bodyweight only')}
- Restrictions: {user_data.get('restrictions', 'None')}

Create a weekly workout plan with:
1. 3-4 workouts per week
2. Progressive difficulty
3. Safety considerations
4. Proper warm-up and cool-down
5. Exercise modifications for injuries

Return as structured JSON with exercises, sets, reps, and form cues.
"""
        return prompt

    def create_diet_prompt(self, user_data):
        """Create optimized prompt for diet plan generation"""
        prompt = f"""
You are a certified nutritionist. Create a personalized meal plan for:

User Profile:
- Age: {user_data.get('age', 'Not specified')}
- Gender: {user_data.get('gender', 'Not specified')}
- Weight: {user_data.get('weight', 'Not specified')}kg
- Height: {user_data.get('height', 'Not specified')}cm
- Goal: {user_data.get('body_goal', 'Maintenance')}
- Dietary Preferences: {user_data.get('diet_preference', 'No restrictions')}
- Activity Level: {user_data.get('fitness_level', 'Moderate')}

Create a daily meal plan with:
1. Calculated calorie targets
2. Macro breakdown (protein, carbs, fats)
3. 3 main meals + 2 snacks
4. Shopping list
5. Prep instructions

Return as structured JSON with meals, calories, and macros.
"""
        return prompt

    def generate_plan(self, prompt, plan_type="workout"):
        """
        Generate AI plan using OpenRouter API (DeepSeek R1 Free)
        Fallback to rule-based generation if API fails
        """
        try:
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": "http://localhost:5000",  # Required for OpenRouter
                "X-Title": "FitCoach AI"  # Required for OpenRouter
            }

            data = {
                "model": "deepseek/deepseek-r1:free",  # FIXED: Use the correct free model name
                "messages": [
                    {"role": "system", "content": "You are a professional fitness and nutrition expert."},
                    {"role": "user", "content": prompt}
                ],
                "stream": False,
                "temperature": 0.7,
                "max_tokens": 2000
            }

            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)

            if response.status_code == 200:
                result = response.json()
                return result['choices'][0]['message']['content']
            else:
                logger.warning(f"OpenRouter API request failed: {response.status_code} - {response.text}")
                return self._fallback_generation(plan_type)

        except Exception as e:
            logger.error(f"Error calling OpenRouter API: {str(e)}")
            return self._fallback_generation(plan_type)

    def _fallback_generation(self, plan_type):
        """Fallback rule-based plan generation"""
        if plan_type == "workout":
            return self._generate_workout_fallback()
        else:
            return self._generate_diet_fallback()

    def _generate_workout_fallback(self):
        """Generate basic workout plan as fallback"""
        return {
            "plan_name": "Beginner Full Body Workout",
            "duration": "4 weeks",
            "frequency": "3 days per week",
            "exercises": [
                {
                    "name": "Bodyweight Squats",
                    "sets": 3,
                    "reps": "10-15",
                    "rest": "60 seconds",
                    "instructions": "Keep your chest up and weight on your heels"
                },
                {
                    "name": "Push-ups",
                    "sets": 3,
                    "reps": "5-12",
                    "rest": "60 seconds",
                    "instructions": "Modify on knees if needed"
                },
                {
                    "name": "Plank",
                    "sets": 3,
                    "reps": "30-60 seconds",
                    "rest": "60 seconds",
                    "instructions": "Keep your core tight and body straight"
                },
                {
                    "name": "Mountain Climbers",
                    "sets": 3,
                    "reps": "30 seconds",
                    "rest": "60 seconds",
                    "instructions": "Keep hips level and core engaged"
                }
            ]
        }

    def _generate_diet_fallback(self):
        """Generate basic diet plan as fallback"""
        return {
            "daily_calories": 2000,
            "macros": {
                "protein": "25%",
                "carbs": "45%",
                "fats": "30%"
            },
            "meals": [
                {
                    "meal": "Breakfast",
                    "calories": 400,
                    "options": ["Oatmeal with berries and protein powder", "Greek yogurt with nuts and honey"]
                },
                {
                    "meal": "Lunch",
                    "calories": 500,
                    "options": ["Grilled chicken salad with mixed greens", "Quinoa bowl with vegetables and chickpeas"]
                },
                {
                    "meal": "Dinner",
                    "calories": 600,
                    "options": ["Salmon with sweet potato and broccoli", "Lean beef stir-fry with brown rice"]
                },
                {
                    "meal": "Snacks",
                    "calories": 300,
                    "options": ["Apple with almond butter", "Protein smoothie with banana"]
                }
            ]
        }

# FIXED: Initialize AI coach with OPENROUTER_API_KEY
ai_coach = FitnessAI(OPENROUTER_API_KEY)

@app.route('/')
def index():
    """Main application page"""
    return render_template('index.html')

# FIXED: Add favicon route to prevent 404 errors
@app.route('/favicon.ico')
def favicon():
    return '', 204

# FIXED Flask chat function with proper debugging
@app.route('/api/chat', methods=['POST'])
def chat():
    """AI chatbot for fitness questions"""
    try:
        data = request.get_json()
        user_question = data.get('question', '')

        if not user_question:
            return jsonify({'error': 'No question provided'}), 400

        # Debug: Check if API key is loaded
        if not OPENROUTER_API_KEY:
            return jsonify({
                'success': True,
                'response': "❌ OpenRouter API key not found in environment variables"
            })

        prompt = f"""
You are a fitness coach. Answer this question briefly and helpfully:
{user_question}
"""

        try:
            # FIXED: Proper headers for Render deployment
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "HTTP-Referer": request.host_url.rstrip('/'),  # Automatically gets your Render URL
                "X-Title": "FitCoach AI"
            }

            api_data = {
                "model": "deepseek/deepseek-r1:free",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.7
            }

            logger.info(f"🔑 API Key: {OPENROUTER_API_KEY[:20]}...")
            logger.info(f"🌐 Referer: {request.host_url}")

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=api_data,
                timeout=30
            )

            logger.info(f"📊 OpenRouter Status: {response.status_code}")

            if response.status_code == 200:
                result = response.json()
                ai_response = result['choices'][0]['message']['content']
                logger.info("✅ OpenRouter success!")
                return jsonify({
                    'success': True,
                    'response': ai_response
                })
            else:
                error_details = response.text
                logger.error(f"❌ OpenRouter failed: {response.status_code} - {error_details}")
                return jsonify({
                    'success': True,
                    'response': f"OpenRouter Error [{response.status_code}]: {error_details}"
                })

        except Exception as api_error:
            logger.error(f"💥 API Exception: {str(api_error)}")
            return jsonify({
                'success': True,
                'response': f"API Exception: {str(api_error)}"
            })

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500

@app.route('/api/generate-workout', methods=['POST'])
def generate_workout():
    """Generate personalized workout plan"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        user_data = data.get('user_data', {})

        logger.info(f"Generating workout for user: {user_id}")

        # Create workout prompt
        prompt = ai_coach.create_workout_prompt(user_data)

        # Generate workout plan using AI
        workout_plan = ai_coach.generate_plan(prompt, plan_type="workout")

        # Store the workout plan
        if user_id not in workouts_db:
            workouts_db[user_id] = []

        workout_entry = {
            'id': f"workout_{datetime.now().timestamp()}",
            'plan': workout_plan,
            'user_data': user_data,
            'created_at': datetime.now().isoformat(),
            'status': 'generated'
        }

        workouts_db[user_id].append(workout_entry)
        logger.info(f"Workout generated and stored for user: {user_id}")

        return jsonify({
            'success': True,
            'workout_plan': workout_plan,
            'workout_id': workout_entry['id']
        })

    except Exception as e:
        logger.error(f"Error generating workout: {str(e)}")
        return jsonify({'error': 'Failed to generate workout'}), 500

@app.route('/api/generate-meal-plan', methods=['POST'])
def generate_meal_plan():
    """Generate personalized meal plan"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        user_data = data.get('user_data', {})

        logger.info(f"Generating meal plan for user: {user_id}")

        # Create diet prompt
        prompt = ai_coach.create_diet_prompt(user_data)

        # Generate meal plan using AI
        meal_plan = ai_coach.generate_plan(prompt, plan_type="diet")

        # Store the meal plan
        if user_id not in meals_db:
            meals_db[user_id] = []

        meal_entry = {
            'id': f"meal_{datetime.now().timestamp()}",
            'plan': meal_plan,
            'user_data': user_data,
            'created_at': datetime.now().isoformat(),
            'status': 'generated'
        }

        meals_db[user_id].append(meal_entry)
        logger.info(f"Meal plan generated and stored for user: {user_id}")

        return jsonify({
            'success': True,
            'meal_plan': meal_plan,
            'meal_plan_id': meal_entry['id']
        })

    except Exception as e:
        logger.error(f"Error generating meal plan: {str(e)}")
        return jsonify({'error': 'Failed to generate meal plan'}), 500

@app.route('/api/start-workout', methods=['POST'])
def start_workout():
    """Start a workout session"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        workout_type = data.get('workout_type', 'general')

        logger.info(f"Starting workout for user: {user_id}, type: {workout_type}")

        # Create a default workout if no specific workout is provided
        workout_id = f"workout_{datetime.now().timestamp()}"

        # Create workout entry
        workout_entry = {
            'id': workout_id,
            'type': workout_type,
            'status': 'in_progress',
            'started_at': datetime.now().isoformat(),
            'user_id': user_id
        }

        # Store workout
        if user_id not in workouts_db:
            workouts_db[user_id] = []
        workouts_db[user_id].append(workout_entry)

        # Log progress
        if user_id not in progress_db:
            progress_db[user_id] = []

        progress_entry = {
            'type': 'workout_started',
            'workout_id': workout_id,
            'workout_type': workout_type,
            'date': datetime.now().isoformat(),
            'timestamp': datetime.now().isoformat()
        }

        progress_db[user_id].append(progress_entry)

        logger.info(f"Workout started successfully for user: {user_id}")

        return jsonify({
            'success': True,
            'message': 'Workout started successfully',
            'workout_id': workout_id,
            'workout': workout_entry
        })

    except Exception as e:
        logger.error(f"Error starting workout: {str(e)}")
        return jsonify({'error': 'Failed to start workout'}), 500

@app.route('/api/complete-workout', methods=['POST'])
def complete_workout():
    """Complete a workout session"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        workout_id = data.get('workout_id')
        duration = data.get('duration', 0)  # in minutes
        exercises_completed = data.get('exercises_completed', [])

        logger.info(f"Completing workout for user: {user_id}, workout: {workout_id}")

        # Find the workout
        user_workouts = workouts_db.get(user_id, [])
        workout = None
        for w in user_workouts:
            if w['id'] == workout_id:
                workout = w
                break

        if workout:
            # Update workout status
            workout['status'] = 'completed'
            workout['completed_at'] = datetime.now().isoformat()
            workout['duration'] = duration
            workout['exercises_completed'] = exercises_completed

        # Log progress
        if user_id not in progress_db:
            progress_db[user_id] = []

        progress_entry = {
            'type': 'workout_completed',
            'workout_id': workout_id,
            'duration': duration,
            'exercises_completed': len(exercises_completed),
            'date': datetime.now().isoformat(),
            'timestamp': datetime.now().isoformat()
        }

        progress_db[user_id].append(progress_entry)

        logger.info(f"Workout completed successfully for user: {user_id}")

        return jsonify({
            'success': True,
            'message': 'Workout completed successfully',
            'workout': workout
        })

    except Exception as e:
        logger.error(f"Error completing workout: {str(e)}")
        return jsonify({'error': 'Failed to complete workout'}), 500

@app.route('/api/log-meal', methods=['POST'])
def log_meal():
    """Log a meal"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        meal_type = data.get('meal_type', 'general')  # breakfast, lunch, dinner, snack
        food_items = data.get('food_items', [])
        calories = data.get('calories', 0)

        logger.info(f"Logging meal for user: {user_id}, type: {meal_type}")

        # Log progress
        if user_id not in progress_db:
            progress_db[user_id] = []

        progress_entry = {
            'type': 'meal_logged',
            'meal_type': meal_type,
            'food_items': food_items,
            'calories': calories,
            'date': datetime.now().isoformat(),
            'timestamp': datetime.now().isoformat()
        }

        progress_db[user_id].append(progress_entry)

        logger.info(f"Meal logged successfully for user: {user_id}")

        return jsonify({
            'success': True,
            'message': f'{meal_type.capitalize()} logged successfully',
            'meal_entry': progress_entry
        })

    except Exception as e:
        logger.error(f"Error logging meal: {str(e)}")
        return jsonify({'error': 'Failed to log meal'}), 500

@app.route('/api/log-progress', methods=['POST'])
def log_progress():
    """Log user progress data"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        progress_type = data.get('type')  # weight, workout, measurements
        value = data.get('value')
        date = data.get('date', datetime.now().isoformat())

        logger.info(f"Logging progress for user: {user_id}, type: {progress_type}")

        if not progress_type:
            return jsonify({'error': 'Progress type is required'}), 400

        if user_id not in progress_db:
            progress_db[user_id] = []

        progress_entry = {
            'type': progress_type,
            'value': value,
            'date': date,
            'timestamp': datetime.now().isoformat()
        }

        progress_db[user_id].append(progress_entry)

        logger.info(f"Progress logged successfully for user: {user_id}")

        return jsonify({'success': True, 'message': 'Progress logged successfully'})

    except Exception as e:
        logger.error(f"Error logging progress: {str(e)}")
        return jsonify({'error': 'Failed to log progress'}), 500

@app.route('/api/get-workouts/<user_id>', methods=['GET'])
def get_workouts(user_id):
    """Get user's workout plans"""
    try:
        user_workouts = workouts_db.get(user_id, [])
        return jsonify({
            'success': True,
            'workouts': user_workouts
        })

    except Exception as e:
        logger.error(f"Error getting workouts: {str(e)}")
        return jsonify({'error': 'Failed to get workouts'}), 500

@app.route('/api/get-meals/<user_id>', methods=['GET'])
def get_meals(user_id):
    """Get user's meal plans"""
    try:
        user_meals = meals_db.get(user_id, [])
        return jsonify({
            'success': True,
            'meals': user_meals
        })

    except Exception as e:
        logger.error(f"Error getting meals: {str(e)}")
        return jsonify({'error': 'Failed to get meals'}), 500

@app.route('/api/save-profile', methods=['POST'])
def save_profile():
    """Save user profile data"""
    try:
        data = request.get_json()
        user_id = data.get('user_id', 'demo-user')
        profile_data = data.get('profile_data', {})

        logger.info(f"Saving profile for user: {user_id}")

        # Save profile data
        users_db[user_id] = {
            'profile': profile_data,
            'updated_at': datetime.now().isoformat()
        }

        return jsonify({
            'success': True,
            'message': 'Profile saved successfully'
        })

    except Exception as e:
        logger.error(f"Error saving profile: {str(e)}")
        return jsonify({'error': 'Failed to save profile'}), 500

@app.route('/api/get-profile/<user_id>', methods=['GET'])
def get_profile(user_id):
    """Get user profile data"""
    try:
        user_profile = users_db.get(user_id, {})
        return jsonify({
            'success': True,
            'profile': user_profile
        })

    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        return jsonify({'error': 'Failed to get profile'}), 500

@app.route('/api/export-data/<user_id>')
def export_data(user_id):
    """Export user data as JSON"""
    try:
        user_data = {
            'profile': users_db.get(user_id, {}),
            'workouts': workouts_db.get(user_id, {}),
            'meals': meals_db.get(user_id, {}),
            'progress': progress_db.get(user_id, []),
            'exported_at': datetime.now().isoformat()
        }

        # Create JSON file
        json_data = json.dumps(user_data, indent=2)
        buffer = BytesIO()
        buffer.write(json_data.encode())
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f'fitness_data_{user_id}.json',
            mimetype='application/json'
        )

    except Exception as e:
        logger.error(f"Error exporting data: {str(e)}")
        return jsonify({'error': 'Failed to export data'}), 500

@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('500.html'), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False)
