from flask import Flask, jsonify
import re
from flask_cors import CORS, cross_origin
import json



app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
def parse_markdown(markdown_text):
    lines = markdown_text.split('\n')
    title = lines[0].replace('Title:', '').strip()
    
    sections = []
    current_section = None
    current_question = None
    
    for line in lines[1:]:
        if line.strip():
            if line.startswith('Section:'):
                if current_section:
                    sections.append(current_section)
                section_title = line.replace('Section:', '').strip()
                current_section = {
                    'title': section_title,
                    'questions': []
                }
            elif re.match(r'^\d+\.', line):
                if current_question:
                    current_section['questions'].append(current_question)
                question_text = line[3:].strip()
                current_question = {
                    'text': question_text,
                    'options': [],
                    'correctOption': None
                }
            elif re.match(r'^[a-d]\.', line) or re.match(r'^# [a-d]\.', line):
                correct = line.startswith('#')
                option_text = line.replace('# ', '').strip()[3:]
                current_question['options'].append(option_text)
                if correct:
                    current_question['correctOption'] = len(current_question['options']) - 1
    
    if current_question:
        current_section['questions'].append(current_question)
    if current_section:
        sections.append(current_section)
    
    return {
        'title': title,
        'sections': sections
    }





# Function to save parsed JSON data to disk
def save_quiz_data_to_json():
    with open('quiz.md', 'r') as f:
        markdown_text = f.read()
    
    quiz_data = parse_markdown(markdown_text)
    
    with open('quiz_data.json', 'w') as json_file:
        json.dump(quiz_data, json_file, indent=4)

# Endpoint to serve quiz data from disk
@app.route('/quiz_data')
# @cross_origin()
def serve_quiz_data():
    try:
        with open('quiz_data.json', 'r') as json_file:
            quiz_data = json.load(json_file)
        return jsonify(quiz_data)
    except FileNotFoundError:
        return jsonify({'error': 'Quiz data not found'})

if __name__ == '__main__':
    # Save parsed quiz data to JSON file on startup
    save_quiz_data_to_json()
    
    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)






# @app.route('/quiz_data')
# @cross_origin()
# def quiz_data():
#     with open('quiz.md', 'r') as f:
#         markdown_text = f.read()
    
#     quiz_data = parse_markdown(markdown_text)
#     return jsonify(quiz_data)

# if __name__ == '__main__':
#     app.run(debug=True,host='0.0.0.0',port=5000)
