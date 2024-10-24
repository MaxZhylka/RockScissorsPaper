import { SET_AUTH, SET_USER, SET_USERS } from '../actionCreators/authActionTypes';

const initialState = {
    isAuth: false,
    user: {},
    users: [],
};

export const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_AUTH:
            return { ...state, isAuth: action.payload };
        case SET_USER:
            return { ...state, user: action.payload };
        case SET_USERS:
            return { ...state, users: action.payload };
        default:
            return state;
    }
};
