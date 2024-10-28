import { SET_GAME } from "../actionCreators/authActionTypes";
const initialState = {
    _id: "",
    players: [],
    results: [],
    isDisplay: false, 
    winnerId: "",
    winner: ""
};

export const gameReducer = (state = initialState, action)=>
{
    switch (action.type)
    {
        case SET_GAME:
            return {
                ...action.payload 
            };
        default:
            return state;
    }
}