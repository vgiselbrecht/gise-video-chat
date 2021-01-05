# Video Chat based on WebRTC and Firebase

![Video Chat Demo](https://www.gise.at/images/VideoChat.PNG)

## Installation

Load code and dependencies
```
git clone https://github.com/vgiselbrecht/chat.git chat
cd chat
npm install
```

For signaling you need a free [Firebase Project](https://console.firebase.google.com/u/0/) with anonymous authentication and realtime database.

Copy the firebase configuration to the src/config.js files, based on src/config.tmp.js.
```javascript
export default {
    exchangeServices: { 
        firebase: {
            apiKey: "",
            authDomain: "",
            databaseURL: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: "",
            measurementId: ""
        }
    }
}
```

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
