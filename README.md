# Gise Video Chat: Video chat for your own web server
[![Author](https://img.shields.io/badge/Author-vgiselbrecht-brightgreen.svg)](https://github.com/vgiselbrecht)
[![GitHub license](https://img.shields.io/github/license/vgiselbrecht/chat)](https://github.com/vgiselbrecht/chat/blob/master/LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub-ff69b4.svg)](https://github.com/sponsors/vgiselbrecht/)
[![Demo](https://img.shields.io/badge/Demo-Link-blueviolet.svg)](https://chat.gise.at)
![GitHub package.json version](https://img.shields.io/github/package-json/v/vgiselbrecht/chat)

![Video Chat Demo](https://www.gise.at/images/VideoChat.PNG)

## Features

* Open-Source
* For small groups
* Browser based
* Signaling over [Chat Server](https://github.com/vgiselbrecht/gise-video-chat-server) or Firebase
* No media server
* Screen sharing
* Text-Chat with images
* Change of video and microphone source
* Multilingual (English and German)
* Mobile friendly
* Customizable design

## Demo

Demo: [https://chat.gise.at](https://chat.gise.at)

The characters after the hashtag define the room, if no hashtag is selected, the create room dialog is displayed.

For example, all visitors with a link to [https://chat.gise.at/#roulette-chat](https://chat.gise.at#roulette-chat) enter into a room and can communicate with each other there.

Therefore simply forward the current URL to invite others.

## Own installation

This video chat is made to install it on an own web server.
For signaling you can use a free Firebase project or using the [Chat Server](https://github.com/vgiselbrecht/gise-video-chat-server) base on node.js.

### Prerequisites
* Local development environment
    * Git
    * Node.js
    * npm
* Server
    * nginx or apache

### Configuration
Load code and dependencies in your local development environment:
```
git clone https://github.com/vgiselbrecht/gise-video-chat.git gise-video-chat
cd gise-video-chat
npm install
```

#### Create configuration and customize files
Linux
```
cp src/config.tmp.json src/config.json
cp src/assets/sass/_custom.tmp.scss src/assets/sass/_custom.scss 
```
Windows
```
copy src\config.tmp.json src\config.json
copy src\assets\sass\_custom.tmp.scss src\assets\sass\_custom.scss 
```

#### Adjust the configuration

The full configuration can be made in the src/config.json file.

The most important thing is the "exchangeServices" for signaling.
There are two ways for signaling, over the node.js base [Chat Server](https://github.com/vgiselbrecht/gise-video-chat-server) or a free [Firebase Project](https://console.firebase.google.com/u/0/).

In "exchangeServices/service" it is specified whether the Chat Server (chat-server) or Firebase (firebase) is used.

##### Chat Server

For connection to Chat Server you have to install [Chat Server](https://github.com/vgiselbrecht/gise-video-chat-server) on an own server. 
In "exchangeServices/chat-server/host" you have to add the Web Socket URI to this server.

```json
{
    "exchangeServices": { 
        "service": "chat-server",
        "chat-server": {
            "host": "wss://chat-server.example.com"
        }
    },
}
```

##### Firebase

You need to create a free [Firebase Project](https://console.firebase.google.com/u/0/) with anonymous authentication and realtime database.
The Firebase configuration must be deposited at "exchangeServices/firebase". 

```json
{
    "exchangeServices": { 
        "service": "firebase",
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
}
```

##### STUN and TURN Server

Additional STUN / TURN Server can also be added in communication/webrtc/iceServers. To use this video chat behind some Firewalls and NATs, you need a TURN server. 

[List of free STUN and TURN Server](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b)

With certain systems (e.g. Twilio) it is necessary that the IceServers change frequently. Therefore it is possible to load the IceServer configuration dynamically with communication/webrtc/iceServersFromUrl. In the given URL, a return in JSON format is requested in the same way as with the iceServers Parameter ([{"urls": ""},...]).

##### Features

Some features can be activated individually per installation.
* soundEffects (false) -> activate sound effects for diffrent events
* mutePartner (true) -> function to mute partner for all
* soundOffPartner (true) -> function to put the sound off at one for a partner

##### Example full chat configuration
```json
{
    "meta": {
        "title": "Video Chat",
        "description": "Open-Source video chat based on WebRTC and Firebase.",
        "keywords": "chat, webrtc, video-call, video-chat",
        "image": ""
    },
    "privacy": {
        "firebaseAnalytics": 0,
        "imprint": "",
        "gdpr": ""
    },
    "exchangeServices": { 
        "service": "chat-server",
        "chat-server": {
            "host": "wss://"
        }
    },
    "communication": {
        "webrtc": {
            "iceServers": [
                {"urls": "stun:stun.services.mozilla.com"}, 
                {"urls": "stun:stun.l.google.com:19302"}
            ],
            "iceServersFromUrl": ""
        }
    },
    "features": {
        "soundEffects": false,
        "mutePartner": true, 
        "soundOffPartner": true
    }
}
```

#### Adjust the design

You can add your SASS design adaptations into the file "src/assets/sass/_custom.scss". 
The easiest way is to overwrite the variables from _settings.scss here.
This file remains even after an update.


### Deploy video chat for development
```
grunt deploy
```
Add content from dist directory to the document root of your local web server.

### Deploy video chat for production
```
grunt deploy --target=production
```
Copy content from dist directory to your web server.

## Development
```
grunt watch
```
Change the compiled code in dist directory after saving a project file.
Ideally the dist directory is the document root of a local web server like nginx or apache.

## Sponsoring

You can sponsor me through [GitHub Sponsoring](https://github.com/sponsors/vgiselbrecht/).

As a recognition, i would be happy to receive a star.

Suggestions and pull requests for extensions are always welcome.

## License

[Apache License 2.0](LICENSE)
