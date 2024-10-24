module.exports= class userDTO{
    isActivated;
    id;
    email;
    constructor(model)
    {
        this.isActivated=model.isConfirmed;
        this.id=model._id;
        this.email=model.email;
        this.login=model.login;
    }
}