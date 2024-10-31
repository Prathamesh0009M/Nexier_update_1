const Message = require('../models/message');
const Conversation = require('../models/ConverSation');

// get particular conversation data via id 
exports.getConversion = async (req, res) => {
    try {

        const { conversationId } = req.body;
        const conversationData = await Conversation.findById(conversationId)
            .populate({
                path: 'participants',
                select: 'firstName email' // Select only required fields for participants
            })
            .populate({
                path: 'lastMessage',  // Optionally populate the last message
                select: 'content sentAt'
            })

        if (!conversationData) {
            return res.status(404).json({
                success: false,
                message: `Conversation with ID ${conversationId} not found`
            });
        }


        const messages = await Message.find({ conversationId: conversationData._id })
            .sort({ sentAt: 1 })  // Sort messages by sent date (ascending)
            .populate('sender', 'firstName')
            .populate('recipient', 'firstName');

        res.status(200).json({
            success: true,
            data: {
                conversationData,
                messages
            }
        });
    } catch (e) {
        console.error("Error accessing conversation:", e.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to access conversation',
            error: e.message
        });
    }
}












