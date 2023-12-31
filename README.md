# File Drop
A simple implementation of Sockets to share files between two devices.

## Installation
You must have `npm` and `node` preinstalled. 
Libraries used: 
* `React`: Frontend with [`tokyo-night`](https://github.com/enkia/tokyo-night-vscode-theme) theme/color-scheme (it's not beautiful, but it's okay).
* `Express`: Backend
* `Socket.io`: Connecting and emitting/sending to the sockets.
* `nodemon` : idk, it's easier that way (you do not have to run the server each time manually)

```sh
git clone https://github.com/xtanion/file-drop.git
cd file-drop
```

## Run the Server

```sh
nodemon Server
```

## Run the app

```sh
npm start
```

Site should be up and running at [localhost:3000]()

## Preview
![Untitled design](https://github.com/xtanion/file-drop/assets/74976752/9876c0ab-9d61-48f5-b00c-6793b7804b39)

## Todo
- [x] Sharing larger files
- [x] Dynamic blob allocation, (due to memory restrictions)
- [ ] Encrypted byte array transfers
