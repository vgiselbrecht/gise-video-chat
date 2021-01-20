# Free group video chat based on WebRTC and Firebase

![Video Chat Demo](https://www.gise.at/images/VideoChat.PNG)

## Features

* Group video chat with no limits
* Browser based
* Only peer-to-peer connections
* Firebase is only used for signaling
* Screen sharing
* Text-Chat with images
* Change of video and microphone source
* Multilingual (English and German)

## Demo

Live Demo: [https://chat.gise.at](https://chat.gise.at)

The characters after the hashtag define the room, if no hashtag is selected, the create room dialog is displayed.

For example, all visitors with a link to [https://chat.gise.at/#roulette-chat](https://chat.gise.at#roulette-chat) enter into a room and can communicate with each other there.

Therefore simply forward the current URL to invite others.

## Own installation

This video chat is made to install it on an own Webserver.
The Webserver need no server-side programming language, only a free firebase project is required.

### Prerequisites
* Local development environment
    * Git
    * Node.js
    * npm
* Server
    * nginx or apache

### Configuration
Load code and dependencies:
```
git clone https://github.com/vgiselbrecht/chat.git chat
cd chat
npm install
cp src/config.tmp.json src/config.json
```

For signaling you need a free [Firebase Project](https://console.firebase.google.com/u/0/) with anonymous authentication and realtime database.

Copy the firebase configuration to the src/config.json file in exchangeServices/firebase.
```json
{
    "meta": {
        "title": "Video Chat"
    },
    "privacy": {
        "firebaseAnalytics": 0
    },
    "exchangeServices": { 
        "firebase": {
            "apiKey": "",
            "authDomain": "",
            "databaseURL": "",
            "projectId": "",
            "storageBucket": "",
            "messagingSenderId": "",
            "appId": "",
            "measurementId": ""
        }
    },
    "communication": {
        "webrtc": {
            "iceServers": [
                {"urls": "stun:stun.services.mozilla.com"}, 
                {"urls": "stun:stun.l.google.com:19302"}
            ]
        }
    }
}
```
Additional STUN / TURN Server can also be added in communication/webrtc/iceServers.

### Deploy Video Chat for development
```
grunt deploy
```
Add content from dist directory to the document root of your local webserver.

### Deploy Video Chat for production
```
grunt deploy --target=production
```
Copy content from dist directory to your webserver.

## Development
```
grunt watch
```
Change the compiled code in dist directory after saving a project file.
Ideally the dist directory is the document root of a local Webserver like nginx or apache.
