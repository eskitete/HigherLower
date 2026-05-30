document.addEventListener('DOMContentLoaded', function () {
    let jsonData;
    let randomPlayer;
    let attemptCount = 0;
    let gamewin = 0;
    let jsonMode;   
    let jsonListData;
    document.getElementById('player-guess').hidden = true;
    document.querySelector('label[for="player-guess"]').hidden = true;
    document.getElementById('attempts').hidden = true;
    document.getElementById('submit-button').hidden = true;

    // Initialize all-time score
    function initializeAllTimeScore() {
        if (!localStorage.getItem('allTimeScore')) {
            localStorage.setItem('allTimeScore', JSON.stringify({
                easy: { wins: 0, losses: 0 },
                medium: { wins: 0, losses: 0 },
                hard: { wins: 0, losses: 0 }}));}
    }

    function getAllTimeScoreText() { 
        const allTimeScore = JSON.parse(localStorage.getItem('allTimeScore'));
        return `<p>Easy - Wins: ${allTimeScore.easy.wins}, Losses: ${allTimeScore.easy.losses}</p>` +
               `<p>Medium - Wins: ${allTimeScore.medium.wins}, Losses: ${allTimeScore.medium.losses}</p>` +
               `<p>Hard - Wins: ${allTimeScore.hard.wins}, Losses: ${allTimeScore.hard.losses}</p>`;
    }
    
    function updateAllTimeScore(difficulty) {
        const allTimeScore = JSON.parse(localStorage.getItem('allTimeScore'));
        if (allTimeScore[difficulty]) {
            if (gamewin === 1) {
                allTimeScore[difficulty].wins += 1;
            } else {
                allTimeScore[difficulty].losses += 1;
            }
            localStorage.setItem('allTimeScore', JSON.stringify(allTimeScore));} 
    }

    function setMode(mode) {
        jsonMode = mode;
        jsonPull();
    }
    
    function displayResult(isCorrect) {
        const resultElement = document.getElementById('result');
        if (isCorrect) {
            // Display overall guess result
            resultElement.textContent = "Correct!";
            document.getElementById('submit-button').textContent = "Restart";
            attemptCount = 6
            gamewin = 1;   
            updateAllTimeScore(jsonMode);
            
        } else {
            // Player not found
            resultElement.textContent = "Incorrect. Try again!";
        }
    }

    // Function to get a random player
    function getRandomPlayer() {
        const randomIndex = Math.floor(Math.random() * jsonData.players.length);
        return jsonData.players[randomIndex];
    }
    
    function displayAutocompleteSuggestions(searchTerm) {
        const autocompleteContainer = document.getElementById('autocomplete-suggestions');
        autocompleteContainer.innerHTML = '';
        if (!searchTerm || typeof searchTerm !== 'string') {
            return;
        }
        const matchingPlayers = jsonData.players.filter(player =>
            player.Name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        matchingPlayers.forEach(player => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = player.Name;
            suggestionItem.addEventListener('click', () => {
                document.getElementById('player-guess').value = player.Name;
                autocompleteContainer.innerHTML = '';
            });
            autocompleteContainer.appendChild(suggestionItem);
        });
    }

    function jsonPull(){
        console.log(jsonMode)
        // Fetch JSON data and set up random player
        let jsonName = `json/nba${jsonMode}.json`;
        fetch(jsonName)
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            randomPlayer = getRandomPlayer();
            //test logging
            console.log("Random Player:", randomPlayer);
            document.getElementById('submit-button').removeAttribute('disabled');
    
            document.getElementById('player-guess').hidden = false;
            document.querySelector('label[for="player-guess"]').hidden = false;
            document.getElementById('attempts').hidden = false;
            document.getElementById('submit-button').hidden = false;
            document.getElementById('easy-button').hidden = true;
            document.getElementById('medium-button').hidden = true;
            document.getElementById('hard-button').hidden = true;
            })
            .catch(error => console.error('Error fetching data', error));
    }



        let jsonListName = `json/nba.json`;
        fetch(jsonListName)
        .then(response => response.json())
        .then(data => {
            jsonListData = data;
            // Populate the datalist with player names
            const datalist = document.getElementById('player-names');
                jsonListData.players.forEach(player => {
                    const option = document.createElement('option');
                    option.value = player.Name; // Use correct property name
                    datalist.appendChild(option);
                });
                // Search bar functionality
                const searchBar = document.getElementById('player-guess');
                searchBar.addEventListener('input', displayAutocompleteSuggestions);
            })
            .catch(error => console.error('Error fetching data', error));
    
    
    // Function to generate player picture URL
    function getPlayerPictureUrl(player) {
        const [firstName, lastName] = player.Name.split(' ');
        const lastNamePart = lastName.replace(/[^a-zA-Z ]/g, "").substring(0, 5).toLowerCase();
        const firstNamePart = firstName.replace(/[^a-zA-Z ]/g, "").substring(0, 2).toLowerCase();
        return `https://www.basketball-reference.com/req/202106291/images/headshots/${lastNamePart}${firstNamePart}01.jpg`;
    }
    
    // Function to compare player's guess with the correct answer
    function checkGuess() {
        
        
        // Create a new row for the guessed player's accolades
        const guessedPlayerRow = document.createElement('div');
        guessedPlayerRow.classList.add('guessed-player-row');
        const playerInfo = document.getElementById('player-info');
        
        // Get the user's guessed player
        const playerGuess = document.getElementById('player-guess').value;
        if (!jsonListData) {return;}
        let guessedPlayer = jsonListData.players.find(player => player.Name.toLowerCase() === playerGuess.toLowerCase());
        if (guessedPlayer== null && attemptCount<6) {
            document.getElementById('result').textContent="Enter a valid guess";
            return;
        }

        // Increment attempt counter
        attemptCount++;
        // Update the attempts display
        const attemptsElement = document.getElementById('attempts');
        attemptsElement.textContent = `Attempts: ${attemptCount}/6`;
        // Check if the maximum number of attempts has been reached
        if (attemptCount > 6) {
            // Display the game over message
            const resultElement = document.getElementById('result');
            resultElement.textContent = "Out of attempts! Game over!";
            // Optionally display the correct player
            const correctPlayerElement = document.getElementById('correct-player');            
            correctPlayerElement.innerHTML = `<p>The correct player was: <strong>${randomPlayer.Name}</strong></p>`;
            document.getElementById('submit-button').addEventListener('click', location.reload());
            // Exit the function 
            return; 
        }

        // Compare the user's guessed player's accolades with the random player's accolades
        for (const accolade in guessedPlayer) {
            if (accolade !== "Name") {
                const guessedValue = guessedPlayer[accolade];
                const randomValue = randomPlayer[accolade];
                
                const accoladeElement = document.createElement('div');
                accoladeElement.classList.add('accolade-row');
                accoladeElement.innerHTML = `<span class= acc-name>${accolade}: <span class="accolade-value">${guessedValue}</span><span class="arrow"></span></span>`;
                
                // Compare the user's guessed player's accolade with the random player's accolade
                if (guessedValue > randomValue) {
                    accoladeElement.querySelector('.arrow').textContent = ' ↓';
                    accoladeElement.style.color = 'red';
                    if(accolade=="All-Star" && guessedValue-3 <= randomValue){
                        accoladeElement.style.color = 'gold'
                    }
                    else if(accolade=="Draft-Year" && guessedValue-3 <= randomValue){
                        accoladeElement.style.color = 'gold'
                    } 
                    //else if (guessedValue-1 <= randomValue){
                    //    accoladeElement.style.color = 'gold'
                    //}
                } else if (guessedValue < randomValue) {
                    accoladeElement.querySelector('.arrow').textContent = ' ↑';
                    accoladeElement.style.color = 'red';
                    if(accolade=="All-Star" && guessedValue+3 >= randomValue){
                        accoladeElement.style.color = "gold"
                    }
                    else if(accolade=="Draft-Year" && guessedValue+3 >= randomValue){
                        accoladeElement.style.color = 'gold'
                    } 
                    //else if (guessedValue+1 >= randomValue ){
                    //    accoladeElement.style.color = 'yellow'
                    //}

                } else {
                    accoladeElement.querySelector('.arrow').textContent = '';
                    accoladeElement.style.color = 'green';
                }
                guessedPlayerRow.appendChild(accoladeElement);   
            }
        }
        
        // Display the guessed player's accolades
        playerInfo.prepend(guessedPlayerRow);
        console.log(guessedPlayer.Name)
        // Display the correct answer
        displayResult(guessedPlayer.Name === randomPlayer.Name);
        
        // Create the player picture element
        if(gamewin==0){
            const guessedPlayerImage = getPlayerPictureUrl(guessedPlayer);
            const playerPictureElement = document.createElement('div');
            const playerNameElement = document.createElement('div');
            playerNameElement.innerHTML = `<p>${guessedPlayer.Name}</p>`
            playerPictureElement.innerHTML = `<img src="${guessedPlayerImage}" alt="${guessedPlayer.Name}" onerror="this.src='data/placeholder.jpg';" width="100" height="100"/>`;
            if (guessedPlayerRow) {
                guessedPlayerRow.prepend(playerPictureElement);
                guessedPlayerRow.prepend(playerNameElement)
            } else {
                playerInfo.appendChild(playerPictureElement);
                guessedPlayerRow.prepend(playerNameElement)
            }
        }
        //attempt limit
        if(attemptCount==6){
            document.getElementById('submit-button').textContent = "Restart";
            const correctPlayerElement = document.getElementById('correct-player');
            correctPlayerElement.innerHTML = `<p>The correct player was: <strong>${randomPlayer.Name}</strong></p>`;
            if(gamewin==1){correctPlayerElement.style.color = 'green'}
            //row for random player if game is lost 
            const randomPlayerRow = document.createElement('div');
            randomPlayerRow.classList.add('guessed-player-row');    
            //creates correct answer row
            if(gamewin == 0){
                updateAllTimeScore(jsonMode);
                
                for (const accolade in randomPlayer) {
                    if (accolade !== "Name") {
                        const randomValue = randomPlayer[accolade];
                        const randomAccoladeElement = document.createElement('div');
                        randomAccoladeElement.classList.add('accolade-row');
                        randomAccoladeElement.innerHTML = `<span class= acc-name>${accolade}: <span class="accolade-value">${randomValue}</span><span class="arrow"></span></span>`;
                        randomPlayerRow.appendChild(randomAccoladeElement);
                    }}
                    playerInfo.prepend(randomPlayerRow);
            }
            // Create the player picture element
            const randomPlayerImage = getPlayerPictureUrl(randomPlayer);    
            const playerPictureElement = document.createElement('div');
            const playerNameElement = document.createElement('div');
            playerNameElement.innerHTML = `<p>${randomPlayer.Name}</p>`
            playerPictureElement.innerHTML = `<img src="${randomPlayerImage}" alt="${randomPlayer.Name}" onerror="this.src='data/placeholder.jpg';"width="120" height="180"/>`;
            playerInfo.prepend(playerPictureElement);
            attemptCount++;
        }
        //clear text box
        document.getElementById('player-guess').value='';
    }
    
    // Call initialization
    initializeAllTimeScore();
    
    document.getElementById('easy-button').addEventListener('click', () => setMode('easy'));
    document.getElementById('medium-button').addEventListener('click', () => setMode('medium'));
    document.getElementById('hard-button').addEventListener('click', () => setMode('hard'));
    document.getElementById('score-button').addEventListener('click', () => {
        const scoreText = getAllTimeScoreText();
        document.getElementById('modal-score').innerHTML = scoreText;
        // Show modal and overlay
        document.getElementById('score-modal').style.display = 'block';
        document.getElementById('modal-overlay').style.display = 'block';
    });
    // Close the modal
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('score-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });
    // Close modal when overlay is clicked
    document.getElementById('modal-overlay').addEventListener('click', () => {
        document.getElementById('score-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });
    document.getElementById('info-button').addEventListener('click', function () {
        document.getElementById('info-modal').style.display = 'block';
        document.getElementById('modal-overlay').style.display = 'block';
    });
    
    document.getElementById('close-info-modal').addEventListener('click', function () {
        document.getElementById('info-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });

    //detect click or enter
    document.getElementById('submit-button').addEventListener('click', checkGuess);
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            checkGuess();
        }
    }); 
});
