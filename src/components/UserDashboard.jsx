import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';

export default function UserDashboard() {
    const { currentUser } = useAuth();
    const { messages, sendMessage, isUserBlocked, loading } = useMessages();
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const messagesEndRef = useRef(null);

    const isBlocked = isUserBlocked(currentUser?.id);
    const maxLength = 500;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
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
            setSuccess('Message sent!');
            setTimeout(() => setSuccess(''), 2000);
        } else {
            setError(result.error);
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
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="dashboard user-dashboard">
                <div className="loading-state">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="dashboard user-dashboard">
            <div className="dashboard-content">
                <div className="messages-section">
                    <div className="section-header">
                        <h2>💬 Messages</h2>
                        <span className="message-count">{messages.length} messages</span>
                    </div>

                    <div className="messages-list">
                        {messages.length === 0 ? (
                            <div className="empty-state">
                                <p>No messages yet. Be the first to send one!</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`message-item ${msg.userId === currentUser?.id ? 'own-message' : ''
                                        } ${msg.role === 'admin' ? 'admin-sent-message' : ''}`}
                                >
                                    <div className="message-header">
                                        <div className="message-author-wrapper">
                                            <span className="message-author">{msg.name}</span>
                                            {msg.role === 'admin' && (
                                                <span className="admin-message-badge">👨‍💼 Admin</span>
                                            )}
                                        </div>
                                        <span className="message-time">
                                            {formatDate(msg.timestamp)} at {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                    <div className="message-text">{msg.text}</div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="message-input-section">
                        {isBlocked ? (
                            <div className="blocked-notice">
                                🚫 You have been blocked by an administrator and cannot send messages.
                            </div>
                        ) : (
                            <form onSubmit={handleSend} className="message-form">
                                <div className="input-wrapper">
                                    <textarea
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value.slice(0, maxLength))}
                                        placeholder="Type your message here..."
                                        rows="3"
                                        disabled={isBlocked}
                                    />
                                    <div className="char-counter">
                                        {messageText.length}/{maxLength}
                                    </div>
                                </div>
                                {error && <div className="error-message">{error}</div>}
                                {success && <div className="success-message">{success}</div>}
                                <button type="submit" className="send-button" disabled={isBlocked}>
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
