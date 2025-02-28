// Copyright 2018-2019 the Deno authors. All rights reserved. MIT license.
// Note: this is a keep-alive server.
const { Server } = require("net");
const port = process.argv[2] || "4544";
console.log("port", port);

const response = Buffer.from(
	"HTTP/1.1 200 OK\r\nContent-Length: 12\r\n\r\nHello World\n",
);

async function write(socket, buffer) {
	const p = new Promise((resolve, _) => {
		socket.write(buffer, resolve);
	});
	return p;
}

Server(async (socket) => {
	socket.on("error", (_) => {
		socket.destroy();
	});
	for await (const _ of socket) {
		write(socket, response);
	}
}).listen(port);
