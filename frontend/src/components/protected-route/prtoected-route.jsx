import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../loader/loader';
import { checkAuth } from '../../actionCreators/authAction';

const ProtectedRoute = ({ children }) => {
    const dispatch = useDispatch();
    const isAuth = useSelector((state) => state.auth.isAuth);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect( () => {
        if (!isAuth) {
            dispatch(checkAuth()).finally(() => {
                setIsCheckingAuth(false); 
            });
        } else {
            setIsCheckingAuth(false);
        }
    }, [isAuth, dispatch]);

    if (isCheckingAuth) {
        return <Loader />;
    }

    return isAuth ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
