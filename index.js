const { app, shell, BrowserWindow, Tray, ipcMain, Menu } = require('electron')
const path = require('path')
const { exec } = require('child_process')
const url = require('url')
const fs = require('fs')
const RPC = require('discord-rpc')
const getTrackInfo = require('./RequestHandler')

const rpc = new RPC.Client({
    transport: 'ipc',
})

rpc.login({
    clientId: '984031241357647892',
})

const themesDir = path.join(__dirname, 'themes')

if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir)
}

let metadata
let tray = null

function createWindow() {
    let win = new BrowserWindow({
        width: 615,
        height: 900,
        minWidth: 615,
        minHeight: 577,
        maxWidth: 615,
        icon: path.join(__dirname, 'src', 'assets', 'appicon.png'),
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, 'src/index.html'),
            protocol: 'file:',
            slashes: true,
        }),
    )

    win.webContents.setWindowOpenHandler(edata => {
        shell.openExternal(edata.url)
        return { action: 'deny' }
    })

    // win.webContents.openDevTools();

    tray = new Tray(path.join(__dirname, 'src', 'assets', 'appicon.png'))
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show App', click: () => win.show() },
      { label: 'Quit', click: () => app.quit() }
    ])
    tray.setToolTip('YMusic DRPC')
    tray.setContextMenu(contextMenu); 
    
    tray.on('click', () => {
      win.show()
    });

    ipcMain.handle('minimizeWin', () => {
        win.minimize()
    })

    ipcMain.handle("closeWin", () => {
      win.hide();
    });  

    ipcMain.handle('patcherWin', () => {
        require('./Patcher')
    })

    ipcMain.handle('pathAppOpen', () => {
        shell.openPath(path.join(__dirname))
    })

    ipcMain.handle('checkFileExists', async () => {
        const fileExists = fs.existsSync(
            process.env.LOCALAPPDATA +
                '\\Programs\\YandexMusic\\resources\\patched.txt',
        )
        console.log(fileExists)
        return fileExists
    })

    setInterval(() => {
        metadata = getTrackInfo()
    }, 1000)

    const updateDiscordRPC = (RPC, data) => {
        const {
            playerBarTitle,
            artist,
            timecodes,
            requestImgTrack,
            linkTitle,
        } = data
        const timeRange =
            timecodes.length === 2 ? `${timecodes[0]} - ${timecodes[1]}` : ''
        const details = artist
            ? `${playerBarTitle} - ${artist}`
            : playerBarTitle
        const largeImage = requestImgTrack[1] || 'ym'
        const smallImage = requestImgTrack[1] ? 'ym' : 'unset'
        const buttons = linkTitle
            ? [
                  {
                      label: '✌️ Open in YandexMusic',
                      url: `yandexmusic://album/${encodeURIComponent(linkTitle)}`,
                  },
              ]
            : null

        RPC.setActivity({
            state: timeRange,
            details: details,
            largeImageKey: largeImage,
            smallImageKey: smallImage,
            smallImageText: 'Yandex Music',
            buttons: buttons,
        })
    }

    const noYMAppDiscordRPC = RPC => {
        RPC.setActivity({
            details: 'AFK',
            largeImageText: 'YM MINI',
            largeImageKey: 'ym',
        })
    }

    setInterval(() => {
        console.log(metadata)
        if (metadata && Object.keys(metadata).length) {
            updateDiscordRPC(rpc, metadata)
        } else {
            noYMAppDiscordRPC(rpc)
        }
    }, 1000)
}

app.on('ready', createWindow)
