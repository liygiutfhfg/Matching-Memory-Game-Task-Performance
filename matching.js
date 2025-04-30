const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('#startButton'),
    pause: document.querySelector('#pauseButton'),
    stop: document.querySelector('#stopButton'),
    restart: document.querySelector('#restartButton'),
    win: document.querySelector('.win'),
};

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
};

const shuffle = array => {
    const cloneArray = [...array];
    for (let i = cloneArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        const original = cloneArray[i];
        cloneArray[i] = cloneArray[randomIndex];
        cloneArray[randomIndex] = original;
    }
    return cloneArray;
};

const pickRandom = (array, items) => {
    const cloneArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * cloneArray.length);
        randomPicks.push(cloneArray[randomIndex]);
        cloneArray.splice(randomIndex, 1);
    }
    return randomPicks;
};

const generateGame = () => {
    const dimensions = parseInt(selectors.board.getAttribute('data-dimension'), 10);
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number");
    }

    const emojis = ['🍌', '🍇', '🍉', '🍓', '🍍', '🍒', '🥝', '🍑', '🍋', '🍊', '🍏', '🍎'];
    const pairsNeeded = (dimensions * dimensions) / 2;

    if (pairsNeeded > emojis.length) {
        throw new Error(`Not enough unique emojis for this board size. Required: ${pairsNeeded}, Available: ${emojis.length}`);
    }

    const picks = pickRandom(emojis, pairsNeeded);
    const items = shuffle([...picks, ...picks]);

    const cardHTML = `
        <div class="board disabled" style="grid-template-columns: repeat(${dimensions}, auto)">
            ${items.map(item => `
                <div class="card">
                    <div class="card-front"></div>
                    <div class="card-back">${item}</div>
                </div>
            `).join('')}
        </div>
    `;

    const parser = new DOMParser().parseFromString(cardHTML, 'text/html');
    const newBoard = parser.querySelector('.board');
    selectors.board.replaceWith(newBoard);
    selectors.board = newBoard;
};

const startGame = () => {
    state.gameStarted = true;
    selectors.start.disabled = true;
    selectors.pause.disabled = false;
    selectors.stop.disabled = false;
    selectors.restart.disabled = false;
    selectors.board.classList.remove('disabled');

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.moves.innerHTML = `${state.totalFlips} moves`;
        selectors.timer.innerHTML = `Time: ${state.totalTime} sec`;
    }, 1000);
};

const pauseGame = () => {
    clearInterval(state.loop);
    state.gameStarted = false;
    selectors.start.disabled = false;
    selectors.pause.disabled = true;
};

const stopGame = () => {
    clearInterval(state.loop);
    state.gameStarted = false;
    state.totalFlips = 0;
    state.totalTime = 0;
    selectors.moves.innerHTML = `0 moves`;
    selectors.timer.innerHTML = `Time: 0 sec`;
    document.querySelectorAll('.card').forEach(card => card.classList.remove('flipped', 'matched'));
    selectors.board.classList.add('disabled');
    selectors.start.disabled = false;
    selectors.pause.disabled = true;
    selectors.stop.disabled = true;
};

const restartGame = () => {
    clearInterval(state.loop);
    state.gameStarted = false;
    state.totalFlips = 0;
    state.totalTime = 0;
    selectors.moves.innerHTML = `0 moves`;
    selectors.timer.innerHTML = `Time: 0 sec`;
    selectors.boardContainer.classList.remove('flipped');
    generateGame();
    attachEventListeners();
    startGame();
};

const flipBackCards = () => {
    document.querySelectorAll('.card:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;
};

const flipCard = card => {
    if (!state.gameStarted) return;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

    state.flippedCards++;
    state.totalFlips++;

    if (state.flippedCards <= 2) {
        card.classList.add('flipped');
    }

    if (state.flippedCards === 2) {
        const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
        if (flippedCards.length === 2 && flippedCards[0].innerText === flippedCards[1].innerText) {
            flippedCards[0].classList.add('matched');
            flippedCards[1].classList.add('matched');
        }

        setTimeout(() => {
            flipBackCards();
        }, 1000);
    }

    if (!document.querySelectorAll('.card:not(.flipped)').length) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br/>
                    with <span class="highlight">${state.totalFlips}</span> moves<br/>
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
            clearInterval(state.loop);
        }, 1000);
    }
};

const attachEventListeners = () => {
    document.addEventListener('click', event => {
        const eventTarget = event.target;
        const eventParent = eventTarget.parentElement;

        if (eventTarget.classList.contains('card-front') && !eventParent.classList.contains('flipped')) {
            flipCard(eventParent);
        }
    });

    selectors.start.addEventListener('click', startGame);
    selectors.pause.addEventListener('click', pauseGame);
    selectors.stop.addEventListener('click', stopGame);
    selectors.restart.addEventListener('click', restartGame);
};

generateGame();
attachEventListeners();
