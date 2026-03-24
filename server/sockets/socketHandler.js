const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', async (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId); // Join personal room for notifications

      // Update online status
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Broadcast online status to all connected users
      io.emit('userOnline', { userId });
      console.log(`User ${userId} is now online`);
    });

    // Send a message
    socket.on('sendMessage', async (data) => {
      try {
        const { conversationId, content, fileUrl, fileType, fileName } = data;
        const senderId = socket.userId;

        if (!senderId) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          content: content || '',
          fileUrl: fileUrl || '',
          fileType: fileType || '',
          fileName: fileName || '',
        });

        const populated = await message.populate('sender', 'name avatar');

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            content: content || (fileUrl ? `Sent a ${fileType || 'file'}` : ''),
            sender: senderId,
            createdAt: new Date(),
          },
          updatedAt: new Date(),
        });

        // Find the other participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          console.error(`Conversation ${conversationId} not found`);
          return;
        }

        const otherParticipant = conversation.participants.find(
          p => p.toString() !== senderId
        );

        // Increment unread count for recipient
        if (otherParticipant) {
          const currentCount = conversation.unreadCount?.get(otherParticipant.toString()) || 0;
          conversation.unreadCount.set(otherParticipant.toString(), currentCount + 1);
          await conversation.save();
        }

        // Emit to both sender and receiver
        io.to(conversationId).emit('newMessage', populated);

        // Also emit to the other user's personal room (for notification)
        if (otherParticipant) {
          io.to(otherParticipant.toString()).emit('messageNotification', {
            conversationId,
            message: populated,
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join a conversation room
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave a conversation room
    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userTyping', {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on('stopTyping', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('userStoppedTyping', {
        userId: socket.userId,
        conversationId,
      });
    });

    // Mark messages as read
    socket.on('markRead', async (data) => {
      try {
        const { conversationId } = data;
        const userId = socket.userId;

        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, read: false },
          { read: true }
        );

        // Reset unread count
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.unreadCount) {
          conversation.unreadCount.set(userId, 0);
          await conversation.save();
        }

        socket.to(conversationId).emit('messagesRead', {
          conversationId,
          userId,
        });
      } catch (error) {
        console.error('Error marking read:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit('userOffline', { userId });
        console.log(`User ${userId} disconnected`);
      }
    });
  });
};

module.exports = { setupSocket, onlineUsers };
