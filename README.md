# Video Chat based on WebRTC and Firebase

![Video Chat Demo](https://www.gise.at/images/VideoChat.PNG)

## Demo

[chat.gise.at](https://chat.gise.at)

The characters after the hashtag define the room, if no hashtag is selected, a room is created dynamically.

For example, all visitors with a link to [chat.gise.at/#roulette-chat](https://chat.gise.at#roulette-chat) enter into a room and can communicate with each other there.

## Own installation

This video chat is made to install it on an own Webserver.
The Webserver need no server-side programming language, only a free firebase project is required.

### Configuration
Load code and dependencies:
```
git clone https://github.com/vgiselbrecht/chat.git chat
cd chat
npm install
```

For signaling you need a free [Firebase Project](https://console.firebase.google.com/u/0/) with anonymous authentication and realtime database.

Copy the firebase configuration to the src/config.json files, based on src/config.tmp.json.
```json
{
    "meta": {
        "title": "Video Chat"
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
To see changes after saving a file.
