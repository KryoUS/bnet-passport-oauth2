/*---------------------------------------IMPORTANT!---------------------------------------
This example is using localhost as the Redirect URL and will need to be changed for production!
Change the Redirect URL at https://develop.battle.net/access/ for Production.

-Install Node Packages-
npm install dotenv express express-session passport passport-bnet

-Create .env File-
Create a .env file for this project with the following...
CLIENT_ID='YOUR_CLIENT_ID_FROM_BLIZZARD_ACCESS'
CLIENT_SECRET='YOUR_CLIENT_SECRET_FROM_BLIZZARD_ACCESS'
SECRET='WHATEVER_YOU_WANT'

-Security Certs-
You'll need to generate a SSL key and cert using OpenSSL.
1. Go to https://code.google.com/archive/p/openssl-for-windows/downloads
2. Download the proper openssl version for your Windows installation.
3. Extract to C:\openssl\ssl, and open it. (This is the default path for the config file, so might as well as put it there.)
4. Launch openssl.exe from within the "bin" folder.
5. Run the following command, "req -x509 -sha256 -nodes -newkey rsa:2048 -days 365 -keyout localhost.key -out localhost.crt" without quotes.
    - You will now have a .crt and a .key file in the "bin" folder.
6. Create a folder in your project named, "security".
7. Copy the .crt and the .key files from "bin" to the "security" folder.

*/

//Require Packages and Set Strategy, Environment Variables, Port, and HTTPS Options.
require('dotenv').config();
const https = require('https');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const strategy = require(`${__dirname}/strategy.js`);
const { SECRET } = process.env;
const port = 3000;
const httpsOptions = {
  key: fs.readFileSync('./security/localhost.key', 'utf8'),
  cert: fs.readFileSync('./security/localhost.crt', 'utf8')
};

//Run Express as App
const app = express();

//Create Express Session using Secret from Environment Variables
app.use(session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false
}));

//Use Passport and Strategy
app.use( passport.initialize() );
app.use( passport.session() );
passport.use( strategy );

passport.serializeUser( function(user, done) {
    done(null, user);
});

passport.deserializeUser( function(obj, done) {
    done(null, obj);
});

//Create Endpoints

//Login starts Passport with bnet Strategy
app.get('/login', passport.authenticate('bnet'));

//Callback after Blizzard Login - IMPORTANT! This must match the callbackURL endpoint from strategy.js
//This will be where Blizzard sends the user after authentication on their pages.
app.get('/auth/bnet/callback',
    passport.authenticate('bnet', { failureRedirect: '/' }), function(req, res){
        res.redirect('/');
    }
);

//Main Page of the App
app.get('/', function(req, res) {
  
    //If the user is Authenticated, show information from req
    if(req.isAuthenticated()) {
        //Req will contain information from the user's browser!
        //This setup uses Express Sessions, so to make calls using the user's token, we change access_token on the URL to be req.session.passport.user.token
        //req.session will include specific information from the user's browser and session
        //req.session.passport will include information from the user's broswer for this session's passport
        var output = '<h1>Express OAuth Test</h1>' + req.user.id + '<br>';

        if(req.user.battletag) {
            output += req.user.battletag + '<br>';
        }

        output += '<a href="/logout">Logout</a>';
        console.log(req.session.passport.user)
        res.send(output);
    //Else we aske the user to log in
    } else {
        res.send('<h1>Express OAuth Test</h1>' + '<a href="/login">Login with Bnet</a>');
    }
});

//Logout will use the logout function on the request and redirct to the front of our app
app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

//Launch the server using the cert and key we provided earlier, using the port we specified.
const server = https.createServer( httpsOptions, app ).listen( port, () => {
  console.log( 'Express server listening on port ' + server.address().port );
} );