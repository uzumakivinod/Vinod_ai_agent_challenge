# Debug script to test your OpenRouter API call
import os
import requests

# Your API key
OPENROUTER_API_KEY = "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"

def test_openrouter_api():
    """Test OpenRouter API call with your exact settings"""
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:5000",
        "X-Title": "FitCoach AI Chat"
    }
    
    data = {
        "model": "deepseek/deepseek-r1:free",
        "messages": [
            {"role": "system", "content": "You are a professional fitness coach providing helpful advice."},
            {"role": "user", "content": "What are the best exercises for building muscle?"}
        ],
        "stream": False,
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    try:
        print("🔄 Testing OpenRouter API...")
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers, 
            json=data, 
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            print(f"✅ SUCCESS! AI Response: {ai_response[:200]}...")
        else:
            print(f"❌ FAILED! Response: {response.text}")
            
        return response
        
    except Exception as e:
        print(f"💥 ERROR: {str(e)}")
        return None

if __name__ == "__main__":
    test_openrouter_api()