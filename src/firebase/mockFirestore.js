
// Mock real-time database that simulates Firebase behavior
// Uses localStorage with custom events for real-time synchronization across tabs/windows

class MockFirestore {
    constructor() {
        this.listeners = new Map();

        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'messages') {
                this.notifyListeners();
            }
        });

        // Listen for custom events from the same tab
        window.addEventListener('localStorageChange', () => {
            this.notifyListeners();
        });
    }

    // Simulate Firestore collection query with real-time listener
    onSnapshot(callback) {
        const listenerId = Math.random().toString(36);
        this.listeners.set(listenerId, callback);

        // Initial data load
        const messages = this.getMessages();
        callback(messages);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listenerId);
        };
    }

    notifyListeners() {
        const messages = this.getMessages();
        this.listeners.forEach(callback => callback(messages));
    }

    getMessages() {
        const stored = localStorage.getItem('messages');
        return stored ? JSON.parse(stored) : [];
    }

    setMessages(messages) {
        localStorage.setItem('messages', JSON.stringify(messages));

        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('localStorageChange'));
    }

    async addMessage(message) {
        const messages = this.getMessages();
        const newMessage = {
            ...message,
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
        };
        messages.push(newMessage);
        this.setMessages(messages);
        return { id: newMessage.id };
    }

    async deleteMessage(messageId) {
        const messages = this.getMessages();
        const filtered = messages.filter(msg => msg.id !== messageId);
        this.setMessages(filtered);
    }

    async deleteAllMessages() {
        this.setMessages([]);
    }
}

export const mockDb = new MockFirestore();
