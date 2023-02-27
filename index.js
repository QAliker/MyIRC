const express = require("express");
const app = express()
// pour laisser express utiliser le CSS et le JS sinon ne marche pas
const path = require("path");

app.use(express.static(path.join(__dirname, "public")))

const http = require("http").createServer(app);

const io = require("socket.io")(http)

const Sequelize = require("sequelize")

//Lien vers la DB
const dbPath = path.resolve(__dirname, "chat.sqlite")

const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    storage: dbPath
})

const Chat = require("./models/chat")(sequelize, Sequelize.DataTypes);

Chat.sync()

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

//connexion à socket et son serveur
io.on("connection", (socket) => {
    console.log("Un utilisateur s'est connecté") 

    // déconnexion à socket
    socket.on("disconnect", () => {
        console.log("Un utilisateur s'est dconnecté")
    })

    socket.on("enter_room", (room => {
        socket.join(room);
        console.log(socket.rooms)
        // lorsque on join la room query pour récup les msg de la room
        Chat.findAll({
            attributes: ["id", "name", "message", "room" ,"createdAt"],
            where: {
                room: room
            }
        }).then(list => {
            socket.emit("init_messages", {messages: JSON.stringify(list)});
        })
    }))

    socket.on("chat_message", (msg) => {
        //stockage du message
        const messages = Chat.create({
            name: msg.name,
            message: msg.message,
            room: msg.room,
            createdAt: msg.createdAt
        }).then(() => {
            //message émit pas à tout le monde mais dans la room
            io.in(msg.room).emit("received_msg", msg);
        }).catch(error => {
            console.log(error);
        });

        socket.on("typing", msg => {
            socket.to(msg.room).emit("usertyping", msg);
        })
    })

    socket.on("leave_room", (room => {
        socket.leave(room);
        console.log(socket.rooms)
    }))

})


http.listen(3000, () => {
    console.log("Sur le port 3000")
})