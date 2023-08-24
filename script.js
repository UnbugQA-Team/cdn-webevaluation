// Inside the iframe's script
const message = { type: 'scriptAdded' }; // Customize the message object as needed
parent.postMessage(message, '*'); // '*' allows communication with any origin, you can restrict it as needed
