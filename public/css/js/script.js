const socket = io();

document.getElementById('hit').addEventListener('click', () => {
    socket.emit('playerMove', { gameId: 'game1', move: 'hit' });
});

document.getElementById('stand').addEventListener('click', () => {
    socket.emit('playerMove', { gameId: 'game1', move: 'stand' });
});

socket.on('updateGame', (gameState) => {
    updateDealerHand(gameState.dealer.hand);
    updatePlayerHands(gameState.players);
});

socket.on('gameFull', () => {
    alert('Game is full. Try joining another game.');
});

socket.emit('joinGame', 'game1');

function updateDealerHand(hand) {
    const dealerHand = document.getElementById('dealer-hand');
    dealerHand.innerHTML = '';
    hand.forEach(card => {
        dealerHand.innerHTML += `<div class="card">${card.rank} of ${card.suit}</div>`;
    });
}

function updatePlayerHands(players) {
    const playerHands = document.getElementById('player-hands');
    playerHands.innerHTML = '';
    players.forEach((player, index) => {
        let playerHandHtml = `<div class="player-hand">Player ${index + 1}: `;
        player.hand.forEach(card => {
            playerHandHtml += `<div class="card">${card.rank} of ${card.suit}</div>`;
        });
        playerHandHtml += `</div>`;
        playerHands.innerHTML += playerHandHtml;
    });
}
