const Message = require('../models/message');



exports.messageHistory = async (req, res) => {
    try {
        const { conversationId } = req.body;

        const allMessage = await Message.find({ conversationId }).exec();

        

        if(!allMessage)
        {
            res.status(404).json({
                success: false,
                data: "no data found",
            });
        }

        res.status(200).json({
            success: true,
            data: allMessage,
        });

    } catch (e) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
}
