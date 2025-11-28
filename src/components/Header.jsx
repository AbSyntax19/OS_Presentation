import { useAuth } from '../contexts/AuthContext';

export default function Header() {
    const { currentUser, logout, isAdmin } = useAuth();

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <h1 className="header-title">💬 Message Platform</h1>
                </div>

                <div className="header-right">
                    <div className="user-info">
                        <span className="user-name">{currentUser?.name}</span>
                        <span className={`role-badge ${isAdmin ? 'admin-badge' : 'user-badge'}`}>
                            {isAdmin ? '👨‍💼 Admin' : '👤 User'}
                        </span>
                    </div>
                    <button onClick={logout} className="logout-button">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
