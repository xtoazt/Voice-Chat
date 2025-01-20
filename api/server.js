const { Server } = require("socket.io");

const io = new Server({
    cors: {
        origin: "*",
    },
});

let users = [];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", ({ name }) => {
        users.push({ id: socket.id, name, isTalking: false });
        io.emit("update-users", users);
    });

    socket.on("talking", ({ name }) => {
        users = users.map((user) =>
            user.name === name ? { ...user, isTalking: true } : { ...user, isTalking: false }
        );
        io.emit("update-users", users);
    });

    socket.on("leave", () => {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("update-users", users);
    });

    socket.on("disconnect", () => {
        users = users.filter((user) => user.id !== socket.id);
        io.emit("update-users", users);
    });
});

io.listen(3000);
