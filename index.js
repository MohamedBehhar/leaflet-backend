const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		allowedHeaders: ['Content-Type'],
		credentials: true,
	},
});

app.use(cors());

const incrementLocation = (long, lat) => {
	const increment = 0.0001;
	return {
		long: long + increment,
		lat: lat + increment,
	};
};

io.on('connection', (socket) => {
	console.log('User connected');

	socket.on('disconnect', () => {
		console.log('User disconnected');
	});
	socket.on('start-moving', (location) => {
		const interval = setInterval(() => {
			location = incrementLocation(location.long, location.lat);
			io.emit('location-update', location);
		}, 500);

		socket.on('disconnect', () => {
			clearInterval(interval);
		});

		socket.on('stop-moving', () => {
			console.log('Stop moving');
			clearInterval(interval);
		});
	});
	socket.on('stop-moving', () => {
		console.log('Stop moving');
	});
});

server.listen(3000, () => {
	console.log('Listening on *:3000');
});
