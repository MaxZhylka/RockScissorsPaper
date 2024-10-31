
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../reducers/authReducer';
import { gameReducer } from '../reducers/game-reducer';
import { tournamentReducer } from '../reducers/tournament-reducer';

const store = configureStore({
    reducer: {
    auth: authReducer,  
    game: gameReducer,
    tournament: tournamentReducer
    },
});
export default store;
