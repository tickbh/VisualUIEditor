'use strict';

/**
 * @module Ipc
 */
let Ipc = {};
module.exports = Ipc;

// requires
const Electron = require('electron');
const ipcMain = Electron.ipcMain;

Ipc.sendToAll = function(message, ...args) {
    args = ["ipc-renderer2all", message, ...args];
    ipcMain.emit.apply(ipcMain, args);

    let webContents = global.mainWindow.webContents;
    if (!webContents) {
        return false;
    }
    webContents.send.apply(webContents, args);
};

Ipc.sendToWins = function(message, ...args) {
    args = ["ipc-renderer2all", message, ...args];
    let webContents = global.mainWindow.webContents;
    if (!webContents) {
        return false;
    }
    webContents.send.apply(webContents, args);
};

Ipc.sendToWinsDirect = function(message, ...args) {
    args = [message, ...args];
    let webContents = global.mainWindow.webContents;
    if (!webContents) {
        return false;
    }
    webContents.send.apply(webContents, args);
};

ipcMain.on('ipc-renderer2all', (event, message, ...args) => {

});