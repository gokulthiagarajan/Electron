const electron = require("electron");
const path = require("path");
const url = require("url");

// SET ENV
process.env.NODE_ENV = "production";

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow, addWindow, helpWindow;

// Listen for app to be ready
app.on("ready", function () {
  // Create new window
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  // Load html in window
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "mainWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Quit app when closed
  mainWindow.on("closed", function () {
    app.quit();
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle add item window
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: "Enter a New Task",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    autoHideMenuBar: true,
  });
  addWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "addWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Handle garbage collection
  addWindow.on("close", function () {
    addWindow = null;
  });
}

// Handle add item window
function createHelpWindow() {
  helpWindow = new BrowserWindow({
    width: 600,
    height: 550,
    title: "Help",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    autoHideMenuBar: true,
  });
  helpWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "helpWindow.html"),
      protocol: "file:",
      slashes: true,
    })
  );
  // Handle garbage collection
  helpWindow.on("close", function () {
    helpWindow = null;
  });
}

// Catch item:add
ipcMain.on("item:add", function (e, item) {
  mainWindow.webContents.send("item:add", item);
  addWindow.close();
  // Still have a reference to addWindow in memory. Need to reclaim memory (Garbage collection)
  addWindow = null;
});

// Create menu template
const mainMenuTemplate = [
  // Each object is a dropdown
  {
    label: "Options",
    submenu: [
      {
        label: "Add Task",
        click() {
          createAddWindow();
        },
      },
      {
        label: "Clear All",
        click() {
          mainWindow.webContents.send("item:clear");
        },
      },
      {
        label: "Quit",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "How to Use",
        click() {
          createHelpWindow();
        },
      },
    ],
  },
];

// If OSX, add empty object to menu
if (process.platform == "darwin") {
  mainMenuTemplate.unshift({});
}

// Add developer tools option if in dev
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Developer Tools",
    submenu: [
      {
        role: "reload",
      },
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  });
}
