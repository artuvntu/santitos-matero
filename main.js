const electron = require('electron')
const {app, BrowserWindow, dialog} = electron

const mongoConnect = require('./src-electron/mongoDB/mongoConnect');
const printerConnect = require('./src-electron/printerConnect');
const graficas = require('./src-electron/graficas');
const nombreNegocio = 'Santitos'

let mainWindow = null
let loginWindow = null
var usuario = null

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
      loginWindow.loadFile('./views/login/'+ 'login' + '.html')
      
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
                //   if (this.usuario) {
                //      // Requerimiento de permisos
                //      console.log("Requerimiento de permisos")
                //   } else {
                //       this.usuario = data.usuario
                //       if (loginWindow) loginWindow.close()
                //       crearVentana()
                //   }    
                dialog.showMessageBox(loginWindow,{
                    title:"Acceso correcto",
                    message: "Bienvenido " + data.usuario.name
                }) 
                  break     
          }
      })
  }
  electron.ipcMain.on("loginComplete",(event, arg) => {
      if (arg.status) {
          iniciarSesion(arg.usuario)
      } else {
          if (usuario && loginWindow) loginWindow.close()
      }
  })
  electron.ipcMain.on('onReadyMainWindow',(event) => {
      event.reply('onReadyMainWindow-reply',{usuario:this.usuario})
  })
  electron.ipcMain.on('onTest',(event,arg) => {
    console.log("se activo el mensaje" + arg)
    event.reply('onTest-reply',"mensaje de vuelta")
  })
  electron.ipcMain.on('printTest',(event,arg) => {
    console.log(arg)
    printerConnect.printTest()
  })
  app.on('ready', () => {
      // crearLoginWindow();
      // if (debug) {
      //     iniciarSesion({user_id:"artuvntu",pass:"artuvntu"})     
      // }
      crearVentana();
  })
  
  app.on('window-all-closed',() => {
      if (process.platform !== 'darwin') {
          app.quit()
      }
  })
  app.on("activate", () => {
      if (mainWindow === null) {
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