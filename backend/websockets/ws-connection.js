const WebSocket = require('ws');
const Game = require('../models/games-model');

const clients = {};

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', async (message) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
        
            const { type, playerId,playerName, gameId, move } = parsedMessage;
        
            switch (type) {
                case 'create': {
                    const game = new Game({
                        players: [],
                        results: []
                    });
                    await game.save();
                    
                    const generatedGameId = game._id; 
                    clients[generatedGameId] = { players: [] };
                    ws.send(JSON.stringify({ type: 'created', gameId: generatedGameId, game }));
                    break;
                }
        
                case 'join': {
                    if (!gameId || gameId === "undefined") {
                        ws.send(JSON.stringify({ error: 'Game not found' }));
                        break;
                    }
                    
                    try {
                        const game = await Game.findById(gameId);
                        if (game) {
                            if (!clients[gameId]) {
                                clients[gameId] = { players: [] };
                            }
                            
                            clients[gameId].players.push(ws);
                            ws.gameId = gameId;
        
                            const existingPlayer = game.players.find(p => p.playerId === playerId);
                            if (!existingPlayer) {
                                game.players.push({ playerId: playerId, playerName:playerName, moves: [] });
                                await game.save();
                            }
        
                            clients[gameId].players.forEach((playerWs) => {
                                playerWs.send(JSON.stringify({ type: 'joined', game }));
                            });
                        } else {
                            ws.send(JSON.stringify({ error: 'Game not found' }));
                        }
                    } catch (error) {
                        console.error('Error handling join:', error);
                        ws.send(JSON.stringify({ error: 'An error occurred' }));
                    }
                    break;
                }
                case 'move': {
                    if (clients[gameId]) {
                        const game = await Game.findById(gameId);
                        if (game) {
                            const player = game.players.find(p => p.playerId === playerId);
                            if (player) {
                                player.moves.push(move);
                                await game.save();

                                clients[gameId].players.forEach((playerWs) => {
                                    playerWs.send(JSON.stringify(game));
                                });
                            } else {
                                ws.send(JSON.stringify({ error: 'Player not found' }));
                            }
                        } else {
                            ws.send(JSON.stringify({ error: 'Game not found' }));
                        }
                    }
                    break;
                }

                case 'end': {
                    if (clients[gameId]) {
                        const game = await Game.findById(gameId);
                        if (game) {
                            game.results.push({ winnerId: playerId, round: 3 });
                            await game.save();

                            clients[gameId].players.forEach((playerWs) => {
                                playerWs.send(JSON.stringify({ type: 'end', message: 'Game over' }));
                            });
                            delete clients[gameId];
                        } else {
                            ws.send(JSON.stringify({ error: 'Game not found' }));
                        }
                    }
                    break;
                }
            }
        });
    });
};

module.exports = setupWebSocket;
