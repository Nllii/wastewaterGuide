let quizData = {};

function loadQuiz(data) {
    quizData = data;
    document.getElementById('quiz-title').innerText = quizData.title;

    const sectionSelector = document.getElementById('section-selector');
    sectionSelector.innerHTML = '<option value="">Select Section</option>';
    
    quizData.sections.forEach((section, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.innerText = section.title;
        sectionSelector.appendChild(option);
    });
}

function loadSection() {
    const sectionSelector = document.getElementById('section-selector');
    const selectedIndex = sectionSelector.value;
    
    const questionsContainer = document.getElementById('quiz-questions');
    questionsContainer.innerHTML = '';
    
    if (selectedIndex === '') return;
    
    const section = quizData.sections[selectedIndex];
    
    section.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const questionText = document.createElement('p');
        questionText.innerText = `${index + 1}. ${question.text}`;
        questionDiv.appendChild(questionText);
        
        question.options.forEach((option, optionIndex) => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="radio" name="question${index}" value="${optionIndex}">
                ${option}
            `;
            questionDiv.appendChild(label);
            questionDiv.appendChild(document.createElement('br'));

            label.querySelector('input').addEventListener('change', () => checkAnswer(question, optionIndex));
        });
        
        questionsContainer.appendChild(questionDiv);
    });
}

function checkAnswer(question, selectedOptionIndex) {
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');
    
    if (question.correctOption == selectedOptionIndex) {
        correctSound.currentTime = 0;  // Reset time to ensure it plays from start
        correctSound.play();
    } else {
        incorrectSound.currentTime = 0;  // Reset time to ensure it plays from start
        incorrectSound.play();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://127.0.0.1:5000/quiz_data')
    // fetch('./quiz_data.json')

        .then(response => response.json())
        .then(data => loadQuiz(data))
        .catch(error => console.error('Error loading quiz data:', error));
});
