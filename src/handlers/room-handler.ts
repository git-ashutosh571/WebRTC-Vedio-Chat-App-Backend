import { Socket } from "socket.io";
import logger from "../../config/logger-config"; // Update the path to logger-config
import { v4 as UUIDv4 } from 'uuid';
import IRoomParams from "../interfaces/IRoomParams";

const rooms: Record<string,string[]> = {};

const roomHandler = (socket: Socket) => {
    const createRoom = () => {
        const roomId = UUIDv4();
        socket.join(roomId);

        rooms[roomId] = [];

        socket.emit("room-created", { roomId });
        logger.info(`Room Created with ID: ${roomId}`);
    }

    const joinedRoom = ( {roomId,peerId}: IRoomParams) => {
        if(rooms[roomId]){
            logger.info(`New user has joined the room ${roomId} with peer id as ${peerId}`);
            rooms[roomId].push(peerId);
            logger.info(JSON.stringify(rooms));
            socket.join(roomId);


            // whenever anyone joins the room

            socket.on("ready", () => {
                // from the frontend once someone joins the room we will emit a ready event
                // then from our server we will emit an event to all the clients conn that a new peer has added
                socket.to(roomId).emit("user-joined", {peerId});
            });


            socket.emit("get-users", {
                roomId,
                participants: rooms[roomId]

            });


        }

    }

    socket.on("create-room", createRoom);
    socket.on("joined-room", joinedRoom);
}

export default roomHandler;
