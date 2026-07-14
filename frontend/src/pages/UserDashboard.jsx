import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { logout, user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <h2>Job Seeker Dashboard</h2>
          <button onClick={logout} className="btn" style={{ background: 'var(--danger)', color: 'white', width: 'auto' }}>
            Logout
          </button>
        </div>
        <p>Welcome to TalentMatch AI! (ID: {user?.id})</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>My Profile</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Resume upload and job matching features will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
