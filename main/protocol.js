'use strict';

let Protocol = {};
module.exports = Protocol;

const Electron = require('electron');
const Console = require('./console');
const app = Electron.app;
var Url = require('url');
var Fs = require('fs');

Protocol.init = function () {
  const protocol = Electron.protocol;
  // register protocol app://
  protocol.registerFileProtocol('app', (request, cb) => {
    if ( !request.url ) {
      cb (-3); // ABORTED
      return;
    }

    let url = decodeURIComponent(request.url);
    let uri = Url.parse(url);

    let relativePath = uri.hostname;
    if ( uri.pathname ) {
      relativePath = relativePath + uri.pathname;
    }

    let file = app.getAppPath() + "/" + relativePath;
    cb ( { path: file } );
  }, err => {
    if ( err ) {
      Console.log( 'Failed to register protocol app, %s', err.message );
      return;
    }
    Console.log( 'protocol app registered' );
  });

  protocol.registerFileProtocol('packages', (request, cb) => {
    if ( !request.url ) {
      cb (-3); // ABORTED
      return;
    }

    let url = decodeURIComponent(request.url);
    let uri = Url.parse(url);

    let relativePath = uri.hostname;
    if ( uri.pathname ) {
      relativePath = relativePath + uri.pathname;
    }
    let file = app.getAppPath() + "/package/" + relativePath;
    if( Fs.existsSync(file) ) {
        cb ( { path: file } );
        return;
    }

    file = app.getAppPath() + "/third/package/" + relativePath;
    if( Fs.existsSync(file) ) {
        cb ( { path: file } );
        return;
    }
  }, err => {
    if ( err ) {
      Console.log( 'Failed to register protocol app, %s', err.message );
      return;
    }
    Console.log( 'protocol packages registered' );
  });


};
