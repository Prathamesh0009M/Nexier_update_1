const Message = require('../models/message');
const Conversation = require('../models/ConverSation');
const User = require('../models/User');
const message = require('../models/message');

const socketHandler = (io) => {
    io.on('connection', (socket) => {

        // Join a conversation room
        socket.on('joinConversation', ({ conversationId }) => {
            socket.join(conversationId);
        });
        
        // Listen for message events
        socket.on('sendMessage', async ({ senderId, recipientId, content, conversationId }) => {
            try {
                let conversation = await Conversation.findById(conversationId);

                // if (!conversation) {
                //     // Create a new conversation if it does not exist
                //     conversation = await Conversation.create({
                //         participants: [senderId, recipientId]
                //     });

                //     // Update both users with the new conversation ID
                //     await Promise.all([
                //         User.findByIdAndUpdate(senderId, { $push: { converSationId: conversation._id } }),
                //         User.findByIdAndUpdate(recipientId, { $push: { converSationId: conversation._id } })
                //     ]);
                // }

                // Create the new message
                const message = await Message.create({
                    sender: senderId,
                    conversationId: conversationId,
                    content,
                    sentAt: new Date()
                });

                // Update the conversation's last message
                conversation.lastMessage = message;
                await conversation.save();

                // Broadcast the message to all client  s in the conversation room
                io.to(conversationId).emit('receiveMessage', {
                    senderId,
                    recipientId,
                    content: message.content,
                    sentAt: message.sentAt,
                    conversationId
                });
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        // Clean up on disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;

