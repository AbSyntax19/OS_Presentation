import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const result = login(username, password);
        if (!result.success) {
            setError(result.error);
        }
    };

    const quickLogin = (user, pass) => {
        setUsername(user);
        setPassword(pass);
        setTimeout(() => {
            const result = login(user, pass);
            if (!result.success) {
                setError(result.error);
            }
        }, 100);
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1>🔐 Multi-Role Auth</h1>
                    <p>Demonstrate role-based authentication</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button type="submit" className="login-button">
                        Login
                    </button>
                </form>

                <div className="demo-accounts">
                    <p className="demo-title">Quick Login:</p>
                    <div className="demo-buttons">
                        <button
                            onClick={() => quickLogin('admin', 'admin123')}
                            className="demo-button admin-demo"
                        >
                            👨‍💼 Admin
                        </button>
                        <button
                            onClick={() => quickLogin('user1', 'user123')}
                            className="demo-button user-demo"
                        >
                            👤 User 1
                        </button>
                        <button
                            onClick={() => quickLogin('user2', 'user123')}
                            className="demo-button user-demo"
                        >
                            👤 User 2
                        </button>
                        <button
                            onClick={() => quickLogin('user3', 'user123')}
                            className="demo-button user-demo"
                        >
                            👤 User 3
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
