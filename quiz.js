let quizData = {};
let score = 0;
let totalQuestions = 0; // Total number of questions across all sections

function loadQuiz(data) {
    quizData = data;
    document.getElementById('quiz-title').innerText = quizData.title;

    const sectionSelector = document.getElementById('section-selector');
    sectionSelector.innerHTML = '<option value="">Select Section</option>';

    // Calculate the total number of questions in the entire quiz
    totalQuestions = quizData.sections.reduce((sum, section) => sum + section.questions.length, 0);

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

    let questionOffset = 0;
    for (let i = 0; i < selectedIndex; i++) {
        questionOffset += quizData.sections[i].questions.length;
    }

    section.questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        
        const questionText = document.createElement('p');
        questionText.innerHTML = highlightText(`${questionOffset + index + 1}. ${question.text}`);
        questionDiv.appendChild(questionText);

        addHighlightEvents(questionText); // Add highlight events
        
        question.options.forEach((option, optionIndex) => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="radio" name="question${questionOffset + index}" value="${optionIndex}">
                ${option}
            `;
            label.className = 'option-label';
            questionDiv.appendChild(label);
            questionDiv.appendChild(document.createElement('br'));

            label.querySelector('input').addEventListener('change', () => checkAnswer(question, optionIndex, label));
        });
        
        questionsContainer.appendChild(questionDiv);
    });
}

function checkAnswer(question, selectedOptionIndex, label) {
    const correctSound = document.getElementById('correct-sound');
    const incorrectSound = document.getElementById('incorrect-sound');
    
    if (question.correctOption == selectedOptionIndex) {
        correctSound.pause();  // Ensure it's not playing
        correctSound.play();
        score += 1;  // Increment score for correct answer
        label.classList.add('correct');  // Add strikeout class for correct answer
        correctSound.currentTime = 0;  // Reset time to ensure it plays from start
    } else {
        incorrectSound.pause();  // Ensure it's not playing
        incorrectSound.currentTime = 0;  // Reset time to ensure it plays from start
        incorrectSound.play();
        score -= 1;  // Decrement score for incorrect answer
    }

    updateScore();  // Update score display
}

function updateScore() {
    const scoreContainer = document.getElementById('quiz-results');
    scoreContainer.innerText = `Score: ${score}`;
}

function highlightText(text) {
    // Replace words wrapped in {} with highlighted version
    return text.replace(/{(.*?)}/g, '<span class="highlightable">$1</span>');
}

function addHighlightEvents(element) {
    element.addEventListener('mouseup', highlightTextOnSelect);
    element.addEventListener('touchend', highlightTextOnSelect);
}

function highlightTextOnSelect() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();
        const span = document.createElement('span');
        span.classList.add('highlighter');
        span.appendChild(selectedText);
        range.insertNode(span);
        selection.removeAllRanges(); // Clear selection after highlighting
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // fetch('http://127.0.0.1:5000/quiz_data')
    fetch('./quiz_data.json')
        .then(response => response.json())
        .then(data => {
            loadQuiz(data);
        })
        .catch(error => console.error('Error loading quiz data:', error));
});
