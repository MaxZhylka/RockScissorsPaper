const Game = require('../models/games-model');


const createGame = async (req, res) => {
    try {
        const newGame = new Game({
            players: [], 
            results: [],
        });
        const savedGame = await newGame.save(); 
        res.json({ gameId: savedGame._id }); 
    } catch (error) {
        res.status(500).json({ message: "Ошибка создания игры", error });
    }
};
