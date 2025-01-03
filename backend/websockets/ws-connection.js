const WebSocket = require('ws');
const Game = require('../models/games-model');
const determineRoundWinner = require("../controllers/game-controller");
const Tournament = require('../models/tournament');
const clients = {};

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('New WebSocket connection established');

        ws.on('message', async (message) => {
            const parsedMessage = JSON.parse(message);
            console.log(parsedMessage);
            
            const { type, playerId,playerName, gameId, move, tournamentName, onlyTwoPlayers } = parsedMessage;
        
            switch (type) {
                case 'tournament':
                    {
                        
                        const games = Array.from({ length: 3 }, (_, index) =>
                            new Game({
                                players: [],
                                results: [],
                                gameNumber: `${index + 1}` 
                            })
                        );
    
                        
                        const savedGames = await Promise.all(games.map(game => game.save()));
                        const generatedGameIds = savedGames.map(game => game._id);
    
                        
                        for (let i = 0; i < savedGames.length - 1; i++) {
                            savedGames[i].nextGameId = generatedGameIds[i + 1];
                            await savedGames[i].save(); 
                        }
    
                        
                        const tournament = new Tournament({
                            games: generatedGameIds,
                            name: tournamentName
                        });
                        const savedTournament = await tournament.save();
    
                        
                        const lastGameIndex = savedGames.length - 1;
                        savedGames[lastGameIndex].nextGameId = `Tournament ${savedTournament._id}`;
                        await savedGames[lastGameIndex].save();
    
                        
                        generatedGameIds.forEach(generatedGameId => clients[generatedGameId] = { players: [] });
    
                        ws.send(JSON.stringify({
                            type: 'tournament',
                            gameId: generatedGameIds[0],
                            tournament: savedTournament,
                            game: savedGames[0]
                        }));
                        break;
                    }
                case 'create': {
                    const game = new Game({
                        players: [],
                        results: [],
                        onlyTwoPlayers: onlyTwoPlayers
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
                            const playerAlradyExist = game.players.find(player=>player.playerId===playerId);
                            
                            clients[gameId].players.push(ws);
                            ws.gameId = gameId;
                            ws.playerId = playerId;
                            
                            if(game.onlyTwoPlayers && game.players.length >= 2&&!playerAlradyExist) {
                                ws.send(JSON.stringify({ error: 'Game is full',game:game }));
                                break;
                            }
                            if(game.winnerId) {
                                ws.send(JSON.stringify({ error: 'Game is over',game:game }));
                                break;
                            }
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
                                    if (game.players.length > 2) {
                                        
                                        const winnerPlayerIds = winners.map(w => w.playerId);
                                        const winnerPlayerNames = winners.map(w => w.playerName);
                                        const score = 175*(game.results.length+1);
                                        // Устанавливаем isLoose для проигравших
                                        if (winners.length === 0) {
                                        
                                            await Game.updateOne(
                                                { _id: gameId },
                                                {
                                                    $push: {
                                                        results: {
                                                            winnerId: [], 
                                                            winnerName: "Draw",
                                                            round: updatedGame.results.length + 1
                                                        }
                                                    },
                                                    $set: {
                                                        isDisplay: true
                                                    }
                                                }
                                            );

                                            const updatedGameWithResults = await Game.findById(gameId);
                                            clients[gameId].players.forEach((playerWs) => {
                                                console.log("sendingDrawResults");
                                                playerWs.send(JSON.stringify({ type: 'roundResult', game: updatedGameWithResults }));
                                            });
                                        } else
                                        {
                                        for (const player of activePlayers) {
                                            if (!winners.map(obj => obj.playerId).includes(player.playerId)) {
                                                await Game.updateOne(
                                                    { _id: gameId, "players.playerId": player.playerId },
                                                    {$set: { "players.$.isLoose": true , 
                                                            isDisplay: true,
                                                            "players.$.score": score
                                                            },
                                                            $push: {
                                                                results: {
                                                                    winnerId: winnerPlayerIds,
                                                                    winnerName: winnerPlayerNames,
                                                                    round: updatedGame.results.length + 1
                                                                } },
                                                    }
                                                    
                                                );
                                            }
                                        }
                                        
                                    }} else {
                                        const pointsDraw = 100;
                                        const pointsWin = 300;
                                        const pointsLoss = 50;

                                        const winnerPlayerIds = winners.map(w => w.playerId);
                                        const winnerPlayerNames = winners.map(w => w.playerName);
                                        if(winners.length===0)
                                        {
                                            await Game.updateMany(
                                                {
                                                    $inc:{"players.$[].score":pointsDraw}
                                                }
                                            );
                                        }
                                        else
                                        {
                                            await Game.updateOne(
                                                
                                                {_id:gameId, "players.playerId":winnerPlayerIds[0]},
                                                {
                                                    $inc: {"players.$.score":pointsWin}
                                                }
                                                
                                            );
                                            await Game.updateOne(
                                                {_id:gameId, "players.playerId":{$ne: winnerPlayerIds[0]}},
                                                {
                                                    $inc: {"players.$.score":pointsLoss}
                                                }
                                            )
                                        }

                                        
                                        await Game.updateOne(
                                            { _id: gameId },
                                            {
                                                $push: {
                                                    results: {
                                                        winnerId: winnerPlayerIds,
                                                        winnerName: winnerPlayerNames,
                                                        round: updatedGame.results.length + 1
                                                    }
                                                
                                                },
                                                $set: { 
                                                    isDisplay: true 
                                                    
                                                }
                                                
                                            }
                                        );
                                        
                                    }
                                    
                                        const updatedGameWithNewResult = await Game.findById(gameId);
                                    
                                        // Для двух игроков проверяем счётчик побед после обновления результатов
                                        for (const player of activePlayers) {
                                            const wins = updatedGameWithNewResult.results.filter(result => result.winnerId.includes(player.playerId)).length;
                                            
                                            if (wins >= 3) {
                                                await Game.updateOne(
                                                    { _id: gameId },
                                                    { 
                                                        $set: { 
                                                            winner: player.playerName, 
                                                            winnerId: player.playerId, 
                                                            isDisplay: true 
                                                        }
                                                    }
                                                );
                                    
                                                // Получаем финальное состояние игры и отправляем обновление всем игрокам
                                                const finalGameState = await Game.findById(gameId);
                                                clients[gameId].players.forEach((playerWs) => {
                                                    playerWs.send(JSON.stringify({ type: 'gameOver', game: finalGameState }));
                                                });
                                                return;
                                            }
                                        }
                                    
                                
                                    const updatedGameWithResults = await Game.findById(gameId);
                                    clients[gameId].players.forEach((playerWs) => {
                                        console.log("sendingResults")
                                        playerWs.send(JSON.stringify({ type: 'roundResult', game: updatedGameWithResults }));
                                    });
                
                                    // Проверяем условие окончания игры для игры с 3 и более игроками
                                    const remainingPlayers = updatedGameWithResults.players.filter(p => !p.isLoose);
                                    const scoreResult = (game.results.length+2)*175;
                                    console.log(remainingPlayers);
                                    console.log(scoreResult)
                                    if (remainingPlayers.length === 1) {
                                        const winnerPlayer = remainingPlayers[0];
                                        await Game.updateOne(
                                            { _id: gameId, "players.playerId":winnerPlayer.playerId },
                                            { $set: { winner: winnerPlayer.playerName,
                                                    "players.$.score":scoreResult,
                                                    winnerId: winnerPlayer.playerId,
                                                
                                                } }
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
                                        if(!game.winnerId){
                                        await Game.updateOne(
                                            { _id: gameId },
                                            { $set: { isDisplay: false } }
                                        );
                                        }
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
                
                case 'giveUp':
                {
                    if (clients[gameId]) {
                        const game = await Game.findById(gameId);
                        if (game) {
                            let updatedGame;
                            if (game.players.length === 2) {
                                const winner = game.players.find(player => player.playerId !== playerId);
                                await Game.updateOne(
                                    { _id: gameId },
                                    { 
                                        $set: { 
                                            winner: winner.playerName, 
                                            winnerId: winner.playerId, 
                                            isDisplay: true 
                                        }
                                    }
                                );
                                
                                updatedGame = await Game.findById(gameId);
                            } else {
                                const looser = game.players.find(player => player.playerId === playerId);
                                looser.isLoose = true;
                            
                                updatedGame = await game.save();
                            }
                            console.log(updatedGame);
                            clients[gameId].players.forEach((playerWs) => {
                                playerWs.send(JSON.stringify({ type: 'giveUp', game: updatedGame }));
                            });
                        }
                    }
                }
            }
        });
        ws.on('close', async () => {
            const { gameId, playerId } = ws;
            if (gameId && clients[gameId] && clients[gameId].players) {
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
