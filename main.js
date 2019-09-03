const electron = require('electron')
const {app, BrowserWindow, dialog} = electron

const mongoConnect      = require('./src-electron/mongoDB/mongoConnect');
const printerConnect    = require('./src-electron/printerConnect');
const login             = require('./src-electron/loginE');
const graficas          = require('./src-electron/graficas');
const ventas            = require('./src-electron/ventas'); 

const nombreNegocio = 'Santitos'

let mainWindow = null
let loginWindow = null
var usuario = null

const debug = true

function inicializar() {

  unaSolaInstancia()

  function crearLoginWindow() {
      const windowOptions = {
          width: 500,
          minWidth: 500,
          maxWidth: 500,
          height: 300,
          minHeight: 300,
          maxHeight: 300,
          title: "Login",
          webPreferences: {
              nodeIntegration: true
          },
          transparent:true,
          frame:false
          
      }
      loginWindow = new BrowserWindow(windowOptions)
      loginWindow.setAlwaysOnTop(true,"modal-panel")
      loginWindow.isMovable(false)
      loginWindow.loadFile('./src-electron/login/login.html')
      
      loginWindow.on('close', () => {
          if (mainWindow) {
              mainWindow.setIgnoreMouseEvents(false)
          }
      })
      if (mainWindow) {
          mainWindow.setIgnoreMouseEvents(true)
      }
  }
  function crearVentana() {
      const windowOptions = {
          width: 1200,
          minWidth:680,
          height: 840,
          minHeight: 450,
          title: nombreNegocio,
          webPreferences: {
              nodeIntegration: true
          }
      }
      mainWindow = new BrowserWindow(windowOptions)
      // mainWindow.loadFile('./dist/santitos-pos/index.html')
      mainWindow.loadURL('http://localhost:4200')
      mainWindow.on('closed', () => {
          mainWindow = null
          usuario = null
      })
  }
  function iniciarSesion(usuario){
      mongoConnect.iniciarSesion(usuario,(data) => {
          switch (data.status) {
              case mongoConnect.respuestasIniciarSesion.fail:
                  dialog.showMessageBox(loginWindow,{
                      title: "Algo salio mal",
                      message: "Vuelve a intentar"
                  })
                  console.log(data.err)
                  break
              case mongoConnect.respuestasIniciarSesion.accesoIncorrecto:
                  dialog.showMessageBox(loginWindow,{
                      title:"Acceso incorrecto",
                      message: "Vuelve a intentarlo"
                  }) 
                  break
              case mongoConnect.respuestasIniciarSesion.good:
                  if (this.usuario) {
                     // Requerimiento de permisos
                     console.log("Requerimiento de permisos")
                  } else {
                      this.usuario = data.usuario
                    //   dialog.showMessageBox(loginWindow,{
                    //     title:"Acceso correcto",
                    //     message: "Bienvenido " + data.usuario.name
                    //     }); 
                      if (loginWindow) loginWindow.close()
                      crearVentana()
                  }    
                
                  break     
          }
      })
  }
  electron.ipcMain.on('please-user',(event) => {
    // event.returnValue = this.usuario;
    event.reply('please-user-R', this.usuario);
  })
  electron.ipcMain.on("loginComplete",(_, arg) => {
    if (arg.status) {
        iniciarSesion(arg.usuario)
    } else {
        if (usuario && loginWindow) loginWindow.close()
    }
  })
  electron.ipcMain.on("logout", ( ) => {
    if (mainWindow) {
      mainWindow.close()
    }
  }); 
  electron.ipcMain.on('printTest',(_,arg) => {
    console.log(arg)
    printerConnect.printTest()
  })
  electron.ipcMain.on('get-menu',(event) => {
    let resultado = [];
    if (this.usuario) {
        const permisos = this.usuario.permisos;
        if (permisos <= 2) {
            resultado.push({
                "state": "ventas",
                "name": "Ventas",
                "type": "link",
                "icon": "store"
              });
            if (permisos <= 1) {
                resultado.push( ... [{
                    "state": "configuracion",
                    "name": "Configuracion",
                    "type": "link",
                    "icon": "build"
                  },{
                    "state": "historial",
                    "name": "Historial",
                    "type": "sub",
                    "icon": "history",
                    "children":[
                      {
                        "state": "historialCortes",
                        "name": "Cortes",
                        "type": "link",
                        "icon": "folder_open"
                      },
                      {
                        "state": "historialTickets",
                        "name": "Tickets",
                        "type": "link",
                        "icon": "receipt"
                      }
                    ]
                  },
                  {
                    "state": "menu",
                    "name": "Menu",
                    "type": "sub",
                    "icon": "restaurant_menu",
                    "children": [
                      {
                        "state": "platillos",
                        "name": "Platillos",
                        "type": "link",
                        "icon": "fastfood"
                      },
                      {
                        "state": "adicionales",
                        "name": "Adicionales",
                        "type": "link",
                        "icon": "plus_one"
                      }
                    ]
                  }]);
                if (permisos <= 0) {
                    resultado.push({
                        "state": "graficas",
                        "name": "Graficas",
                        "type": "link",
                        "icon": "donut_small"
                      } , ... [{
                        "state": "personal",
                        "name": "Personal",
                        "type": "link",
                        "icon": "people"
                      },
                      {
                        "state": "menu",
                        "name": "Menu",
                        "type": "sub",
                        "icon": "restaurant_menu",
                        "children": [
                          {
                            "state": "platillos",
                            "name": "Platillos",
                            "type": "link",
                            "icon": "fastfood"
                          },
                          {
                            "state": "adicionales",
                            "name": "Adicionales",
                            "type": "link",
                            "icon": "plus_one"
                          }
                        ]
                      },]);
                }
            }
        }
    }

    event.returnValue = resultado;
  })
  app.on('ready', () => {
      crearLoginWindow();
      if (debug) {
        iniciarSesion({user_id:"artuvntu",pass:"artuvntu"})     
      }
  })
  
  app.on('window-all-closed',() => {
      if (process.platform !== 'darwin') {
          app.quit()
      }
  })
  app.on("activate", () => {
      if (mainWindow === null) {
        this.usuario = null;  
        crearLoginWindow();
          
      }
  })
  
}

function unaSolaInstancia() {
  if (process.mas) return
  app.requestSingleInstanceLock()
  app.on('second-instance',() => {
      if (mainWindow) {
          if (mainWindow.isMinimised()) mainWindow.restore()
          mainWindow.focus()
      }
  })
}

inicializar()
graficas.inicializar()
ventas.inicializar()
login.inicializar()