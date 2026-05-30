document.addEventListener('DOMContentLoaded', function () {
    let jsonData;
    let randomPlayer;
    let attemptCount = 0;
    let gameWin = 0;
    let jsonMode;

    // Initialize all-time score
    function initializeAllTimeScore() {
        if (!localStorage.getItem('allTimeScore')) {
            localStorage.setItem('allTimeScore', JSON.stringify({ wins: 0, losses: 0 }));
        }
    }

    function updateAllTimeScore(isWin) {
        const allTimeScore = JSON.parse(localStorage.getItem('allTimeScore'));
        if (isWin) {
            allTimeScore.wins += 1;
        } else {
            allTimeScore.losses += 1;
        }
        localStorage.setItem('allTimeScore', JSON.stringify(allTimeScore));
    }

    function displayAllTimeScore() {
        const allTimeScore = JSON.parse(localStorage.getItem('allTimeScore'));
        const scoreElement = document.getElementById('all-time-score');
        if (!scoreElement) {
            const container = document.querySelector('.container');
            const newScoreElement = document.createElement('div');
            newScoreElement.id = 'all-time-score';
            newScoreElement.style.marginTop = '20px';
            newScoreElement.innerHTML = `<p>All-Time Score: Wins - ${allTimeScore.wins}, Losses - ${allTimeScore.losses}</p>`;
            container.appendChild(newScoreElement);
        } else {
            scoreElement.innerHTML = `<p>All-Time Score: Wins - ${allTimeScore.wins}, Losses - ${allTimeScore.losses}</p>`;
        }
    }

    // Call initialization
    initializeAllTimeScore();
    displayAllTimeScore();

    // Existing code for handling difficulty selection and game logic
    document.getElementById('easy-button').addEventListener('click', () => setMode('easy'));
    document.getElementById('medium-button').addEventListener('click', () => setMode('medium'));
    document.getElementById('hard-button').addEventListener('click', () => setMode('hard'));

    function displayResult(isCorrect) {
        const resultElement = document.getElementById('result');
        if (isCorrect) {
            resultElement.textContent = "Correct!";
            document.getElementById('submit-button').textContent = "Restart";
            attemptCount = 6;
            gameWin = 1;
        } else {
            resultElement.textContent = "Incorrect. Try again!";
        }
    }

    // Function to check the guess
    function checkGuess() {
        const playerGuess = document.getElementById('player-guess').value;
        if (!jsonData) return;
        const guessedPlayer = jsonData.players.find(player => player.Name.toLowerCase() === playerGuess.toLowerCase());
        if (!guessedPlayer && attemptCount < 6) {
            document.getElementById('result').textContent = "Enter a valid guess";
            return;
        }

        attemptCount++;
        document.getElementById('attempts').textContent = `Attempts: ${attemptCount}/6`;

        if (attemptCount >= 6 || guessedPlayer === randomPlayer) {
            if (guessedPlayer === randomPlayer) {
                gameWin = 1;
            }
            updateAllTimeScore(gameWin === 1);
            displayAllTimeScore();

            const resultMessage = gameWin === 1 ? "Congratulations! You guessed correctly!" : "Game over! You ran out of attempts!";
            document.getElementById('result').textContent = resultMessage;
            const correctPlayerElement = document.getElementById('correct-player');
            correctPlayerElement.innerHTML = `<p>The correct player was: <strong>${randomPlayer.Name}</strong></p>`;
            document.getElementById('submit-button').addEventListener('click', () => location.reload());
        }
    }

    document.getElementById('submit-button').addEventListener('click', checkGuess);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    });

    // Other existing functions like setMode(), jsonPull(), etc.
});
