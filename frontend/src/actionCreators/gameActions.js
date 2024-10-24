import { SET_GAME } from "./authActionTypes";

export const setGame = (gameData) => ({
    type: SET_GAME,
    payload: gameData, 
});