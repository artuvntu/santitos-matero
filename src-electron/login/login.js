const ipcRenderer = (require('electron')).ipcRenderer;


document.getElementById("login").onsubmit = (event) => {
    event.preventDefault()
    let forma = document.querySelector("#login")
    let textFieldPass = forma.querySelector('input[name="pass"]')
    let textFieldUser = forma.querySelector('input[name="user"]')
    let enviar = 0
    if (!textFieldUser.value) {
        textFieldUser.classList.add("incorrect")
        enviar += 1
    } else {
        textFieldUser.classList.remove("incorrect")
    }
    if (!textFieldPass.value) {
        textFieldPass.classList.add("incorrect")
        enviar += 1
    } else {
        textFieldPass.classList.remove("incorrect")
    }
    if (enviar === 0) {
        ipcRenderer.send('loginComplete',{
            status:true,
            usuario: {
                user_id:textFieldUser.value,
                pass:textFieldPass.value
            }
        })
    }
}
document.body.addEventListener("click",(event) => {
    if (event.target.id == "cancel") {
        event.preventDefault()
        ipcRenderer.send('loginComplete',{
            status:false
        })
    }
    
})