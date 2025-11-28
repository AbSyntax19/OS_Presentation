import { useState } from 'react';
import { useMessages } from '../contexts/MessageContext';

const ALL_USERS = [
    { id: 2, username: 'user1', name: 'Dimple' },
    { id: 3, username: 'user2', name: 'Paul' },
    { id: 4, username: 'user3', name: 'Ayan' },
];

export default function AdminDashboard() {
    const {
        messages,
        deleteMessage,
        deleteAllMessages,
        blockedUsers,
        blockUser,
        unblockUser,
        getSpamStats,
        sendMessage,
        loading,
        version, // Include version to ensure re-renders
    } = useMessages();

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const spamStats = getSpamStats();
    const maxLength = 500;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!messageText.trim()) {
            setError('Message cannot be empty');
            return;
        }

        const result = await sendMessage(messageText.trim());
        if (result.success) {
            setMessageText('');
            setSuccess('Admin message sent!');
            setTimeout(() => setSuccess(''), 2000);
        } else {
            setError(result.error);
        }
    };

    const handleDelete = async (messageId) => {
        if (confirm('Are you sure you want to delete this message?')) {
            const result = await deleteMessage(messageId);
            if (!result.success) {
                alert('Failed to delete message: ' + result.error);
            }
        }
    };

    const handleClearAll = async () => {
        if (confirm('⚠️ Are you sure you want to delete ALL messages? This action cannot be undone!')) {
            const result = await deleteAllMessages();
            if (result.success) {
                console.log('✅ All messages deleted successfully');
            } else {
                console.error('❌ Failed to delete messages:', result.error);
            }
        }
    };

    const handleToggleBlock = (userId) => {
        if (blockedUsers.includes(userId)) {
            unblockUser(userId);
        } else {
            if (confirm('Are you sure you want to block this user?')) {
                blockUser(userId);
            }
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredMessages = messages
        .filter(msg => {
            if (filter !== 'all') {
                return msg.username === filter;
            }
            return true;
        })
        .filter(msg => {
            if (searchTerm) {
                return msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    msg.name.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return true;
        });

    const getUserMessageCount = (userId) => {
        return messages.filter(msg => msg.userId === userId).length;
    };

    if (loading) {
        return (
            <div className="dashboard admin-dashboard">
                <div className="loading-state">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="dashboard admin-dashboard">
            <div className="dashboard-content">
                {/* Stats Overview */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <div className="stat-value">{messages.length}</div>
                            <div className="stat-label">Total Messages</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <div className="stat-value">{ALL_USERS.length}</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🚫</div>
                        <div className="stat-info">
                            <div className="stat-value">{blockedUsers.length}</div>
                            <div className="stat-label">Blocked Users</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">⚠️</div>
                        <div className="stat-info">
                            <div className="stat-value">{Object.keys(spamStats).length}</div>
                            <div className="stat-label">Active Conversations</div>
                        </div>
                    </div>
                </div>

                {/* Admin Message Input */}
                <div className="admin-section admin-message-input">
                    <div className="section-header">
                        <h2>📢 Send Admin Message</h2>
                    </div>
                    <form onSubmit={handleSendMessage} className="message-form">
                        <div className="input-wrapper">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value.slice(0, maxLength))}
                                placeholder="Type an admin message to broadcast to all users..."
                                rows="3"
                            />
                            <div className="char-counter">
                                {messageText.length}/{maxLength}
                            </div>
                        </div>
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        <button type="submit" className="send-button admin-send">
                            📢 Send Admin Message
                        </button>
                    </form>
                </div>

                <div className="admin-grid">
                    {/* User Management */}
                    <div className="admin-section user-management">
                        <div className="section-header">
                            <h2>👥 User Management</h2>
                        </div>
                        <div className="user-list">
                            {ALL_USERS.map(user => {
                                const isBlocked = blockedUsers.includes(user.id);
                                const messageCount = getUserMessageCount(user.id);
                                const spamStat = spamStats[user.id];

                                return (
                                    <div key={user.id} className="user-card">
                                        <div className="user-card-header">
                                            <div className="user-card-info">
                                                <div className="user-card-name">{user.name}</div>
                                                <div className="user-card-username">@{user.username}</div>
                                            </div>
                                            <div className="user-card-stats">
                                                <span className="message-badge">{messageCount} msgs</span>
                                                {spamStat?.isNearLimit && (
                                                    <span className="warning-badge">⚠️ High Activity</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="user-card-actions">
                                            <button
                                                onClick={() => handleToggleBlock(user.id)}
                                                className={`toggle-block-btn ${isBlocked ? 'blocked' : ''}`}
                                            >
                                                {isBlocked ? '✅ Unblock User' : '🚫 Block User'}
                                            </button>
                                            {isBlocked && <span className="blocked-label">BLOCKED</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Messages Monitor */}
                    <div className="admin-section messages-monitor">
                        <div className="section-header">
                            <h2>💬 Message Monitor</h2>
                            {messages.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="clear-all-button"
                                    title="Delete all messages"
                                >
                                    🗑️ Clear All
                                </button>
                            )}
                        </div>

                        <div className="filters">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="🔍 Search messages..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">All Users</option>
                                <option value="admin">Admin Messages</option>
                                {ALL_USERS.map(user => (
                                    <option key={user.id} value={user.username}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="messages-list admin-messages">
                            {filteredMessages.length === 0 ? (
                                <div className="empty-state">
                                    <p>No messages found</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <div key={msg.id} className={`message-item admin-message ${msg.role === 'admin' ? 'admin-sent-message' : ''}`}>
                                        <div className="message-header">
                                            <div className="message-author-info">
                                                <span className="message-author">{msg.name}</span>
                                                <span className="message-username">@{msg.username}</span>
                                                {msg.role === 'admin' && (
                                                    <span className="admin-message-badge">👨‍💼 Admin</span>
                                                )}
                                            </div>
                                            <span className="message-time">
                                                {formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                        <div className="message-text">{msg.text}</div>
                                        <div className="message-actions">
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                className="delete-button"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
