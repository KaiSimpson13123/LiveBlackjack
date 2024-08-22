const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

let games = {};

app.get('/', (req, res) => {
    res.render('index');
});

io.on('connection', (socket) => {
    socket.on('joinGame', (gameId) => {
        if (!games[gameId]) {
            games[gameId] = { players: [], dealer: createDealer() };
        }
        if (games[gameId].players.length < 5) {
            games[gameId].players.push({ id: socket.id, hand: [] });
            socket.join(gameId);
            io.to(gameId).emit('updateGame', games[gameId]);
        } else {
            socket.emit('gameFull');
        }
    });

    socket.on('playerMove', (data) => {
        const game = games[data.gameId];
        const player = game.players.find(p => p.id === socket.id);
        if (data.move === 'hit') {
            player.hand.push(dealCard(game.dealer.deck));
        } else if (data.move === 'stand') {
            // Implement stand logic
        }
        io.to(data.gameId).emit('updateGame', game);
    });

    socket.on('disconnect', () => {
        for (const gameId in games) {
            games[gameId].players = games[gameId].players.filter(p => p.id !== socket.id);
            if (games[gameId].players.length === 0) {
                delete games[gameId];
            }
        }
    });
});

function createDealer() {
    return { hand: [], deck: shuffleDeck(createDeck()) };
}

function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function dealCard(deck) {
    return deck.pop();
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
