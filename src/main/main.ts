/* eslint global-require: off, no-console: off, promise/always-return: off */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { IStoreSettingsObject, IStoreTabsObject } from './interfaces';
import { getValue, setValue, deleteValue } from './database';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.handle('get-store-value', (_event, key): any => {
  return getValue(key);
});

ipcMain.handle('set-store-value', (_event, key, value): any => {
  setValue(key, value);
});

ipcMain.handle('delete-store-value', (_event, key): any => {
  deleteValue(key);
});

ipcMain.handle('set-settings-store', (_event, settings): any => {
  setValue('settings', settings as IStoreSettingsObject);
});

ipcMain.handle('get-settings-store', () => {
  return getValue('settings') as IStoreSettingsObject;
});

ipcMain.handle('set-tabs-store', (_event, tabs): any => {
  setValue('tabs', tabs as IStoreTabsObject);
});

ipcMain.handle('get-tabs-store', () => {
  return getValue('tabs') as IStoreTabsObject;
});

ipcMain.handle('delete-tabs-store', () => {
  deleteValue('tabs');
});

ipcMain.handle('set-current-tab', (_event, tab): any => {
  setValue('currentTab', tab);
});

ipcMain.handle('get-current-tab', () => {
  return getValue('currentTab');
});

ipcMain.handle('delete-tab', (_event, tabId): any => {
  const tabs = getValue('tabs') as IStoreTabsObject;
  const newTabs = tabs.tabs.filter((tab) => tab.id !== tabId);
  setValue('tabs', { tabs: newTabs });
});

ipcMain.handle('get-tab', (_event, tabId): any => {
  const tabs = getValue('tabs') as IStoreTabsObject;
  return tabs.tabs.find((tab) => tab.id === tabId);
});

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.shadow/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.setMenu(null);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // eslint-disable-next-line
  new AppUpdater();
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
