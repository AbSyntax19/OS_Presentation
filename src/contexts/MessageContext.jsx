import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { mockDb } from '../firebase/mockFirestore';

const MessageContext = createContext(null);

const SPAM_THRESHOLD = 3; // Max messages per 10 seconds
const SPAM_WINDOW = 10000; // 10 seconds

export function MessageProvider({ children }) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [userMessageTimes, setUserMessageTimes] = useState({});
    const [loading, setLoading] = useState(true);
    const [version, setVersion] = useState(0); // Force re-render counter

    // Load blocked users from localStorage
    useEffect(() => {
        const savedBlockedUsers = localStorage.getItem('blockedUsers');
        if (savedBlockedUsers) {
            setBlockedUsers(JSON.parse(savedBlockedUsers));
        }
    }, []);

    // Real-time listener for messages
    useEffect(() => {
        const unsubscribe = mockDb.onSnapshot((messagesData) => {
            setMessages(messagesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const checkSpam = (userId) => {
        const now = Date.now();
        const times = userMessageTimes[userId] || [];

        // Filter messages within the spam window
        const recentTimes = times.filter((time) => now - time < SPAM_WINDOW);

        if (recentTimes.length >= SPAM_THRESHOLD) {
            return {
                isSpam: true,
                message: 'Slow down! You are sending messages too quickly.',
            };
        }

        return { isSpam: false };
    };

    const sendMessage = useCallback(async (text) => {
        if (!currentUser) return { success: false, error: 'Not authenticated' };

        // Check if user is blocked (admins can always send)
        if (currentUser.role !== 'admin' && blockedUsers.includes(currentUser.id)) {
            return {
                success: false,
                error: 'You have been blocked by an administrator',
            };
        }

        // Check for spam (admins exempt from spam check)
        if (currentUser.role !== 'admin') {
            const spamCheck = checkSpam(currentUser.id);
            if (spamCheck.isSpam) {
                return { success: false, error: spamCheck.message };
            }
        }

        try {
            // Add message
            await mockDb.addMessage({
                userId: currentUser.id,
                username: currentUser.username,
                name: currentUser.name,
                role: currentUser.role,
                text,
            });

            // Update message times for spam detection (not for admin)
            if (currentUser.role !== 'admin') {
                const now = Date.now();
                setUserMessageTimes((prev) => ({
                    ...prev,
                    [currentUser.id]: [...(prev[currentUser.id] || []), now].filter(
                        (time) => now - time < SPAM_WINDOW
                    ),
                }));
            }

            return { success: true };
        } catch (error) {
            console.error('Error sending message:', error);
            return { success: false, error: 'Failed to send message' };
        }
    }, [currentUser, blockedUsers]);

    const editMessage = useCallback(async (messageId, newText) => {
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Find the message to verify ownership
            const message = messages.find(m => m.id === messageId);
            if (!message) {
                return { success: false, error: 'Message not found' };
            }

            // Only allow users to edit their own messages
            if (message.userId !== currentUser.id) {
                return { success: false, error: 'You can only edit your own messages' };
            }

            await mockDb.updateMessage(messageId, newText);
            return { success: true };
        } catch (error) {
            console.error('Error editing message:', error);
            return { success: false, error: 'Failed to edit message' };
        }
    }, [currentUser, messages]);

    const deleteOwnMessage = useCallback(async (messageId) => {
        if (!currentUser) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            // Find the message to verify ownership
            const message = messages.find(m => m.id === messageId);
            if (!message) {
                return { success: false, error: 'Message not found' };
            }

            // Only allow users to delete their own messages
            if (message.userId !== currentUser.id) {
                return { success: false, error: 'You can only delete your own messages' };
            }

            await mockDb.deleteMessage(messageId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, error: 'Failed to delete message' };
        }
    }, [currentUser, messages]);

    const deleteMessage = useCallback(async (messageId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        try {
            await mockDb.deleteMessage(messageId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting message:', error);
            return { success: false, error: 'Failed to delete message' };
        }
    }, [currentUser]);

    const deleteAllMessages = useCallback(async () => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        try {
            await mockDb.deleteAllMessages();
            return { success: true };
        } catch (error) {
            console.error('[deleteAllMessages] Error:', error);
            return { success: false, error: 'Failed to delete all messages' };
        }
    }, [currentUser]);

    const blockUser = useCallback((userId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        if (!blockedUsers.includes(userId)) {
            const updatedBlockedUsers = [...blockedUsers, userId];
            localStorage.setItem('blockedUsers', JSON.stringify(updatedBlockedUsers));
            setBlockedUsers(updatedBlockedUsers);
            setVersion(v => v + 1); // Force re-render
        }
        return { success: true };
    }, [currentUser, blockedUsers]);

    const unblockUser = useCallback((userId) => {
        if (currentUser?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }

        const updatedBlockedUsers = blockedUsers.filter((id) => id !== userId);
        localStorage.setItem('blockedUsers', JSON.stringify(updatedBlockedUsers));
        setBlockedUsers(updatedBlockedUsers);
        setVersion(v => v + 1); // Force re-render
        return { success: true };
    }, [currentUser, blockedUsers]);

    const getSpamStats = () => {
        const now = Date.now();
        const stats = {};

        Object.entries(userMessageTimes).forEach(([userId, times]) => {
            const recentCount = times.filter((time) => now - time < SPAM_WINDOW).length;
            if (recentCount > 0) {
                stats[userId] = {
                    recentMessageCount: recentCount,
                    isNearLimit: recentCount >= SPAM_THRESHOLD - 1,
                };
            }
        });

        return stats;
    };

    const value = useMemo(() => {
        // Define isUserBlocked inside useMemo to capture latest blockedUsers
        const isUserBlocked = (userId) => {
            return blockedUsers.includes(userId);
        };

        return {
            messages,
            blockedUsers,
            sendMessage,
            editMessage,
            deleteOwnMessage,
            deleteMessage,
            deleteAllMessages,
            blockUser,
            unblockUser,
            isUserBlocked,
            getSpamStats,
            loading,
            version,
        };
    }, [messages, blockedUsers, loading, version]); // Re-create when these change

    return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessages() {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessageProvider');
    }
    return context;
}
