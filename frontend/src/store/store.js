
import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from '../reducers/authReducer';
import { gameReducer } from '../reducers/game-reducer';

const store = configureStore({
    reducer: {
    auth: authReducer,  
    game: gameReducer
    },
});
export default store;
