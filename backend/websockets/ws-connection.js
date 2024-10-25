const WebSocket = require('ws');
const Game = require('../models/games-model');
const determinedRoundWinner = require('../controllers/game-controller');
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
                            ws.playerId = playerId;
                
                            const existingPlayer = game.players.find(p => p.playerId === playerId);
                            if (!existingPlayer) {
                                await Game.updateOne(
                                    { _id: gameId },
                                    { $push: { players: { playerId: playerId, playerName: playerName, moves: [], actions: [] } } }
                                );
                            } else {
                                await Game.updateOne(
                                    { _id: gameId, "players.playerId": playerId },
                                    { $push: { "players.$.actions": 'connect' } }
                                );
                            }
                
                            const updatedGame = await Game.findById(gameId); 
                            clients[gameId].players.forEach((playerWs) => {
                                playerWs.send(JSON.stringify({ type: 'joined', game: updatedGame }));
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
                            if (player && !player.isLoose) {
                                // Добавляем ход игрока
                                await Game.updateOne(
                                    { _id: gameId, "players.playerId": playerId },
                                    { $push: { "players.$.moves": move } }
                                );
                
                                const updatedGame = await Game.findById(gameId);
                
                                // Проверяем, сделали ли все активные игроки ход в этом раунде
                                const activePlayers = updatedGame.players.filter(p => !p.isLoose);
                                const allMoved = activePlayers.every(p => p.moves.length === updatedGame.results.length + 1);
                
                                if (allMoved) {
                                    // Определяем победителей раунда
                                    const winners = determineRoundWinner(activePlayers);
                
                                    // Обновляем результаты и устанавливаем флаги для проигравших
                                    if (activePlayers.length > 2) {
                                        // Устанавливаем isLoose для проигравших
                                        for (const player of activePlayers) {
                                            if (!winners.includes(player.playerId)) {
                                                await Game.updateOne(
                                                    { _id: gameId, "players.playerId": player.playerId },
                                                    { $set: { "players.$.isLoose": true } }
                                                );
                                            }
                                        }
                                    } else {
                                        // Для двух игроков увеличиваем счётчик побед
                                        for (const player of activePlayers) {
                                            const wins = updatedGame.results.filter(result => result.winnerId.includes(player.playerId)).length;
                                            if (wins + 1 >= 3 && winners.includes(player.playerId)) {
                                                // Игрок победил в игре
                                                await Game.updateOne(
                                                    { _id: gameId },
                                                    { 
                                                        $set: { winner: player.playerName, winnerId: player.playerId },
                                                        $push: { results: { winnerId: [player.playerId], winnerName: [player.playerName], round: updatedGame.results.length + 1 } },
                                                        $set: { isDisplay: true }
                                                    }
                                                );
                                                // Уведомляем игроков об окончании игры
                                                const finalGameState = await Game.findById(gameId);
                                                clients[gameId].players.forEach((playerWs) => {
                                                    playerWs.send(JSON.stringify({ type: 'gameOver', game: finalGameState }));
                                                });
                                                return;
                                            }
                                        }
                                    }
                
                                    // Добавляем результат раунда
                                    await Game.updateOne(
                                        { _id: gameId },
                                        { 
                                            $push: { results: { winnerId: winners, round: updatedGame.results.length + 1 } },
                                            $set: { isDisplay: true }
                                        }
                                    );
                
                                    const updatedGameWithResults = await Game.findById(gameId);
                                    clients[gameId].players.forEach((playerWs) => {
                                        playerWs.send(JSON.stringify({ type: 'roundResult', game: updatedGameWithResults }));
                                    });
                
                                    // Проверяем условие окончания игры для игры с 3 и более игроками
                                    const remainingPlayers = updatedGameWithResults.players.filter(p => !p.isLoose);
                                    if (remainingPlayers.length === 1) {
                                        const winnerPlayer = remainingPlayers[0];
                                        await Game.updateOne(
                                            { _id: gameId },
                                            { $set: { winner: winnerPlayer.playerName, winnerId: winnerPlayer.playerId } }
                                        );
                                        // Уведомляем игроков об окончании игры
                                        const finalGameState = await Game.findById(gameId);
                                        clients[gameId].players.forEach((playerWs) => {
                                            playerWs.send(JSON.stringify({ type: 'gameOver', game: finalGameState }));
                                        });
                                        return;
                                    }
                
                                    // Задержка перед следующим раундом
                                    setTimeout(async () => {
                                        // Сбрасываем isDisplay
                                        await Game.updateOne(
                                            { _id: gameId },
                                            { $set: { isDisplay: false } }
                                        );
                
                                        const newGameState = await Game.findById(gameId);
                                        clients[gameId].players.forEach((playerWs) => {
                                            playerWs.send(JSON.stringify({ type: 'newRound', game: newGameState }));
                                        });
                                    }, 5000);
                                } else {
                                    // Отправляем обновлённое состояние игры
                                    clients[gameId].players.forEach((playerWs) => {
                                        playerWs.send(JSON.stringify({ type: 'moved', game: updatedGame }));
                                    });
                                }
                            } else {
                                ws.send(JSON.stringify({ error: 'Player is not allowed to make a move or not found' }));
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
        ws.on('close', async () => {
            const { gameId, playerId } = ws;
            if (gameId && clients[gameId]) {
                await Game.updateOne(
                    { _id: gameId, "players.playerId": playerId },
                    { $push: { "players.$.actions": 'disconnect' } }
                );
                const updatedGame = await Game.findById(gameId); 
                clients[gameId].players.forEach((playerWs) => {
                    playerWs.send(JSON.stringify({ type: 'disconnect', game: updatedGame }));
                });
            }
        });
    });
};

module.exports = setupWebSocket;
