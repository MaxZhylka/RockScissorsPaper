import React from "react";
import LoginForm from "../../components/login-form/login-form";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import "./auth-page.css"
import RegistrationForm from "../../components/registratrion-form/registration-form";
const AuthPage=()=>
{
    
    const location = useLocation();
    const isAuth = useSelector((state) => state.auth.isAuth);
    const navigate = useNavigate();
    React.useEffect(() => {
        if (isAuth) {
            navigate('/menu');
        }
    }, [isAuth, navigate]);
    return(<div>
        <h1 className="mainHeader">ROCK | SCISSORS | PAPPER</h1>
        {location.pathname==="/registration"?<RegistrationForm/>:<LoginForm/>}
    </div>);
}
export default AuthPage;