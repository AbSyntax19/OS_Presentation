import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';

export default function UserDashboard() {
    const { currentUser } = useAuth();
    const { messages, sendMessage, editMessage, deleteOwnMessage, isUserBlocked, loading } = useMessages();
    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editText, setEditText] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null); // For showing menu on click
    const messagesEndRef = useRef(null);

    const isBlocked = isUserBlocked(currentUser?.id);
    const maxLength = 500;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        setError('');

        if (!messageText.trim()) {
            return;
        }

        const result = await sendMessage(messageText.trim());
        if (result.success) {
            setMessageText('');
        } else {
            setError(result.error);
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleMessageClick = (msg) => {
        // Only show menu for own messages
        if (msg.userId === currentUser?.id) {
            setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
        }
    };

    const handleEditStart = (msg) => {
        setEditingMessageId(msg.id);
        setEditText(msg.text);
        setActiveMenuId(null); // Close menu
    };

    const handleEditCancel = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const handleEditSave = async (messageId) => {
        if (!editText.trim()) {
            return;
        }

        const result = await editMessage(messageId, editText.trim());
        if (result.success) {
            setEditingMessageId(null);
            setEditText('');
        }
    };

    const handleDeleteClick = (messageId) => {
        setDeleteConfirmId(messageId);
        setActiveMenuId(null); // Close menu
    };

    const handleDeleteConfirm = async () => {
        await deleteOwnMessage(deleteConfirmId);
        setDeleteConfirmId(null);
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmId(null);
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDateDivider = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
        });
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, msg) => {
        const date = new Date(msg.timestamp).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(msg);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="whatsapp-container">
                <div className="loading-state">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="whatsapp-container">
            {/* Chat Header */}
            <div className="whatsapp-header">
                <div className="chat-info">
                    <h2 className="chat-name">Group Chat</h2>
                    <span className="participant-count">{messages.length} messages</span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="whatsapp-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat-state">
                        <div className="empty-icon">💬</div>
                        <p>No messages yet</p>
                        <span>Be the first to send a message!</span>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            <div className="date-divider">
                                <span>{formatDateDivider(msgs[0].timestamp)}</span>
                            </div>
                            {msgs.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`chat-message ${msg.userId === currentUser?.id ? 'own' : 'other'}`}
                                >
                                    {editingMessageId === msg.id ? (
                                        <div className="chat-bubble editing">
                                            <textarea
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value.slice(0, maxLength))}
                                                className="edit-textarea"
                                                autoFocus
                                            />
                                            <div className="edit-actions">
                                                <button
                                                    onClick={() => handleEditSave(msg.id)}
                                                    className="save-btn"
                                                >
                                                    ✓ Save
                                                </button>
                                                <button
                                                    onClick={handleEditCancel}
                                                    className="cancel-btn"
                                                >
                                                    ✕ Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className={`chat-bubble ${msg.userId === currentUser?.id ? 'clickable' : ''}`}
                                            onClick={() => handleMessageClick(msg)}
                                        >
                                            {msg.userId !== currentUser?.id && (
                                                <div className="sender-name">
                                                    {msg.name}
                                                    {msg.role === 'admin' && <span className="admin-badge">Admin</span>}
                                                </div>
                                            )}
                                            <div className="message-content">
                                                <span className="message-text">{msg.text}</span>
                                                <div className="message-meta">
                                                    {msg.editedAt && <span className="edited">edited</span>}
                                                    <span className="message-time">{formatTime(msg.timestamp)}</span>
                                                    {msg.userId === currentUser?.id && <span className="message-status">✓✓</span>}
                                                </div>
                                            </div>

                                            {/* Action Menu - Shows on click */}
                                            {activeMenuId === msg.id && msg.userId === currentUser?.id && (
                                                <div className="message-action-menu">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditStart(msg);
                                                        }}
                                                        className="action-menu-btn"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(msg.id);
                                                        }}
                                                        className="action-menu-btn delete"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            )}

                                            {deleteConfirmId === msg.id && (
                                                <div className="delete-confirmation" onClick={(e) => e.stopPropagation()}>
                                                    <p>Delete this message?</p>
                                                    <div className="delete-actions">
                                                        <button onClick={handleDeleteConfirm} className="confirm">Delete</button>
                                                        <button onClick={handleDeleteCancel} className="cancel">Cancel</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="whatsapp-input">
                {error && <div className="input-error">{error}</div>}
                {isBlocked ? (
                    <div className="blocked-message">
                        🚫 You have been blocked and cannot send messages
                    </div>
                ) : (
                    <form onSubmit={handleSend} className="input-form">
                        <div className="input-container">
                            <textarea
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value.slice(0, maxLength))}
                                placeholder="Type a message"
                                rows="1"
                                disabled={isBlocked}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend(e);
                                    }
                                }}
                            />
                        </div>
                        <button type="submit" className="send-btn" disabled={isBlocked || !messageText.trim()}>
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
