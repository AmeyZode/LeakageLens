import React, { useState } from 'react';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

function UserMenu({ navigate }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/login');
  };

  return (
    <div className="menu-anchor">
      <button type="button" className="user-trigger" onClick={() => setOpen((value) => !value)}>
        <span className="avatar">{user?.name?.charAt(0) || 'L'}</span>
        <span className="user-trigger-copy">
          <strong>{user?.name || 'LeakageLens User'}</strong>
          <small>{user?.email || 'local session'}</small>
        </span>
        <ChevronDown size={15} />
      </button>
      {open && (
        <div className="dropdown user-dropdown">
          <button type="button" onClick={() => { setOpen(false); navigate('/profile'); }}>
            <User size={15} />
            Profile
          </button>
          <button type="button" onClick={() => { setOpen(false); navigate('/settings'); }}>
            <Settings size={15} />
            Settings
          </button>
          <button type="button" className="danger" onClick={handleLogout}>
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
