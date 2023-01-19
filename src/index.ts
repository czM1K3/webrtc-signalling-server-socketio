import { serve } from "std/http/server.ts";
import { Server } from "socketio";
import { z } from "zod";

const io = new Server({
	cors: {
		origin: (Deno.env.get("CORS_ORIGIN") ?? "*").split("|"),
	},
});

type outgoingMessageType = {
	sourceId: string;
	message: string;
	type: string;
};

const incommingMessageSchema = z.object({
	targetId: z.string().length(20),
	message: z.string(),
	type: z.string(),
});

io.on("connection", (socket) => {
	socket.emit("id", socket.id);

	socket.on("message", (message: string) => {
		try {
			const parsedMessage = JSON.parse(message);
			const data = incommingMessageSchema.parse(parsedMessage);

			const out: outgoingMessageType = {
				message: data.message,
				sourceId: socket.id,
				type: data.type,
			};

			const target = io.of("/").sockets.get(data.targetId);
			if (!target) throw new Error("Client not found");
			target.emit("message", JSON.stringify(out));
		} catch (_e) {
			// console.log(e.message);
		}
	});
});

await serve(io.handler(), {
	port: 3000,
});
