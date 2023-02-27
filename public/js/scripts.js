            // connexion au serveur socket
            const socket = io()

            socket.on("connect", () => {
                socket.emit("enter_room", "general")
            })
            window.onload = () => {
                //séléction de l'élément formulaire pour ajouter evenement submit
                document.querySelector("form").addEventListener("submit", (e) => {

                    e.preventDefault();
                    const name = document.querySelector("#name")
                    const message = document.querySelector("#message")
                    const room = document.querySelector("#tabs li.active").dataset.room; 
                    const createdAt = new Date()


                    //envoie, emission d'un message au serveur
                    socket.emit("chat_message", {
                        name: name.value,
                        message: message.value,
                        room: room,
                        createdAt: createdAt
                    })

                })

                // écoute du message pour tout les utilisateur 
                socket.on("received_msg", (msg) => {
                    publishmessages(msg)
                })
                document.querySelectorAll("#tabs li").forEach((tab) => {
                    tab.addEventListener("click", function(){
                        if(!this.classList.contains("active")){
                            const actif = document.querySelector("#tabs li.active")
                            actif.classList.remove("active")
                            this.classList.add("active")
                            document.querySelector("#messages").innerHTML = ""
                            // entrée dans nouvelle salle
                            socket.emit("leave_room", actif.dataset.room)
                            socket.emit("enter_room", this.dataset.room)
                        }
                    })
                })
                socket.on("init_messages", msg => {
                    let data = JSON.parse(msg.messages);
                    console.log(data)
                    if(data != []){
                        data.forEach(donnees => {
                            publishmessages(donnees)
                        })
                    }
                })
                document.querySelector("#messages").addEventListener("input", () => {
                    const name = document.querySelector("#name").value;
                    const room = document.querySelector("#tabs li.active").dataset.room

                    socket.emit("typing", {
                        name: name,
                        room: room
                    })
                })

                socket.on("usertyping", msg => {
                    const wrting = document.querySelector("#writing")

                    wrting.innerHTML = `${msg.name} est en train d'écrire...`
                
                    setTimeout(function(){
                        writing.innerHTML = "";
                    }, 5000)
                })
            }

function publishmessages(msg){
    let created = new Date(msg.createdAt);
    let texte = `<div><p>${msg.name} <small>${created.toLocaleDateString()}:</small></p> <p>${msg.message}</p><div>`
    //innerhtml on va dans la div messages et on ajoute (+=)
    document.querySelector("#messages").innerHTML += texte
}