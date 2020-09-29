const BnetStrategy = require('passport-bnet').Strategy;

//Grabbing ClientID and Secret from Environment Variables.
const { CLIENT_ID, CLIENT_SECRET } = process.env; 

module.exports = new BnetStrategy({
    //ClientID and Secret from https://develop.battle.net/access/
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,

    //This MUST match your Redirect URL from https://develop.battle.net/access/ + Express Port + endpoint.
    callbackURL: "https://localhost" + ":3000" + "/auth/bnet/callback", 

    //OPTIONAL: Can set region here, default is "us"
    region: "us",

    //See "Scopes and OAuth enabled APIs" https://develop.battle.net/documentation/guides/using-oauth
    scope: "wow.profile", 

    //REQUIRED: New OAuth2 User Info endpoint
    userURL: "https://us.battle.net/oauth/userinfo" 
    
}, function(accessToken, refreshToken, profile, done) {
    return done(null, profile);
});