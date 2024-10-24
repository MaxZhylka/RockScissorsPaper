import $api from "../http";

export default class AuthService{
    static async login(email, password){
        return $api.post('/login', {email:email,password:password});
    }
    static async registration(login,email, password){
        return $api.post('/registration', {login,password,email});
    }
    static async logout(){
        return $api.post('/logout');
    }

}