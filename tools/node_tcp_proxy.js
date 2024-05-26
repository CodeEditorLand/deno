const net = require("net");

process.on("uncaughtException", (error) => {
	console.error(error);
});

if (process.argv.length != 4) {
	console.log("usage: %s <localport> <remoteport>", process.argv[1]);
	process.exit();
}

const localport = process.argv[2];
const remoteport = process.argv[3];

const remotehost = "127.0.0.1";

const server = net.createServer((localsocket) => {
	const remotesocket = new net.Socket();

	remotesocket.connect(remoteport, remotehost);

	localsocket.on("data", (data) => {
		const flushed = remotesocket.write(data);
		if (!flushed) {
			localsocket.pause();
		}
	});

	remotesocket.on("data", (data) => {
		const flushed = localsocket.write(data);
		if (!flushed) {
			remotesocket.pause();
		}
	});

	localsocket.on("drain", () => {
		remotesocket.resume();
	});

	remotesocket.on("drain", () => {
		localsocket.resume();
	});

	localsocket.on("close", () => {
		remotesocket.end();
	});

	remotesocket.on("close", () => {
		localsocket.end();
	});

	localsocket.on("error", () => {
		localsocket.end();
	});

	remotesocket.on("error", () => {
		remotesocket.end();
	});
});

server.listen(localport);

console.log(
	"redirecting connections from 127.0.0.1:%d to %s:%d",
	localport,
	remotehost,
	remoteport,
);
