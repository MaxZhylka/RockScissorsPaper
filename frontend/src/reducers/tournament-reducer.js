import { SET_TOURNAMENT } from "../actionCreators/authActionTypes";

const initialState={
    games:[],
    name: "",
    data: ""
};

export const tournamentReducer = ( state = initialState, action)=>
{
    switch (action.type)
    {
        case SET_TOURNAMENT:
            return {
                ...action.payload 
            };
        default:
            return state;
    }
}