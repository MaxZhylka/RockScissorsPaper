import React from "react"
import AuthService from "../../service/authService";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../../actionCreators/authAction";
const Profile =()=>
{
    const dispatch= useDispatch();
    const navigate=useNavigate();
    const logOut =async ()=>
    {
        dispatch(logout()).unwrap();
        navigate("/login");
    }
    return (<div>
        <button className="formBtn" onClick={logOut}>LOG OUT</button>
    </div>);
}
export default Profile;