let quizData = {};
let score = 0;
let totalQuestions = 0; // Total number of questions across all sections
let audioContext;
let correctSoundBuffer;
let incorrectSoundBuffer;


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
        questionText.className = 'highlightable';
        questionText.innerHTML = highlightText(`${questionOffset + index + 1}. ${question.text}`);
        questionDiv.appendChild(questionText);

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

    // Add the event listeners to highlightable elements
    addHighlightEvents();
}

function checkAnswer(question, selectedOptionIndex, label) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        loadSound('correct.mp3').then(buffer => correctSoundBuffer = buffer);
        loadSound('incorrect.mp3').then(buffer => incorrectSoundBuffer = buffer);
    }

    if (question.correctOption == selectedOptionIndex) {
        playSound(correctSoundBuffer);
        score += 1;  // Increment score for correct answer
        label.classList.add('correct');  // Add strikeout class for correct answer
    } else {
        playSound(incorrectSoundBuffer);
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

function addHighlightEvents() {
    const highlightableElements = document.querySelectorAll('.highlightable');
    highlightableElements.forEach(element => {
        element.addEventListener('mouseup', highlightTextOnSelect);
        element.addEventListener('touchend', highlightTextOnSelect);
    });
}

function highlightTextOnSelect() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();
        const span = document.createElement('span');
        span.classList.add('highlight');
        span.appendChild(selectedText);
        range.insertNode(span);
        selection.removeAllRanges(); // Clear selection after highlighting
    }
}

// Deals with how iOS handles audio playback and interruptions

// async function loadSound(url) {
//     const response = await fetch(url);
//     const arrayBuffer = await response.arrayBuffer();
//     return audioContext.decodeAudioData(arrayBuffer);
// }

// function playSound(buffer) {
//     if (!audioContext || !buffer) return;
//     const source = audioContext.createBufferSource();
//     source.buffer = buffer;
//     source.connect(audioContext.destination);
//     source.start(0);
// }


function loadSound(url) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer));
}

function playSound(buffer) {
    if (!audioContext || !buffer) return;
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start(0);
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('./quiz_data.json')
        .then(response => response.json())
        .then(data => {
            loadQuiz(data);
        })
        .catch(error => console.error('Error loading quiz data:', error));
});
