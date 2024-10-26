import axios from 'axios';
import { SET_AUTH, SET_USER, SET_USERS } from './authActionTypes';
import { createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../service/authService';
import { BASE_URL } from '../http';
export const setAuth = (isAuth) => ({
    type: SET_AUTH,
    payload: isAuth,
});

export const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

export const setUsers = (users) => ({
    type: SET_USERS,
    payload: users,
});

export const checkAuth = () => async (dispatch) => {
    try {
        const response = await axios.get(`${BASE_URL}/refresh`, { withCredentials: true });
        localStorage.setItem('token', response.data.accessToken);
        dispatch(setAuth(true));
        dispatch(setUser(response.data.user));
    } catch (e) {
        console.log(e);
    } 
};

export const getUsers = () => async (dispatch) => {
    try {
        const response = await axios.get(`${BASE_URL}/users`);
        dispatch(setUsers(response.data));
    } catch (e) {
        console.log(e);
    }
};
export const login = createAsyncThunk(
    'auth/login',
    async (emailPassword, thunkAPI) => {
        const { email, password } = emailPassword;
        try {
        
        const response = await AuthService.login(email, password);
        localStorage.setItem('token', response.data.token);
        thunkAPI.dispatch(setAuth(true));
        thunkAPI.dispatch(setUser(response.data.user));
        
        } catch (e) {
        return thunkAPI.rejectWithValue(e.response?.data?.message);
        }
    }
);
export const registerUser = createAsyncThunk(
    'auth/register',
    async(data, thunkAPI)=>
    {
        const { name, password, email}= data;
        try{
            const response = await AuthService.registration(name,email,password);
            localStorage.setItem('token', response.data.token);
            thunkAPI.dispatch(setAuth(true));
            thunkAPI.dispatch(setUser(response.data.user));
        }
        catch(e)
        {
            return thunkAPI.rejectWithValue(e.response?.data?.message);
        }
    }
);
export const logout =createAsyncThunk(
    'auth/logout',
    async (_,thunkAPI) => {
        try {
        thunkAPI.dispatch(setAuth(false));
        await AuthService.logout();
        thunkAPI.dispatch(setUser({}));
        } catch (e) {
        return thunkAPI.rejectWithValue(e.response?.data?.message);
        }
    });
