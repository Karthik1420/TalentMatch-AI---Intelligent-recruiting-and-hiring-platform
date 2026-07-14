import { useAuth } from '../context/AuthContext';

const RecruiterDashboard = () => {
  const { logout, user } = useAuth();

  return (
    <div className="dashboard-container">
      <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="dashboard-header">
          <h2>Recruiter Dashboard</h2>
          <button onClick={logout} className="btn" style={{ background: 'var(--danger)', color: 'white', width: 'auto' }}>
            Logout
          </button>
        </div>
        <p>Welcome, Recruiter! (ID: {user?.id})</p>
        
        <div style={{ marginTop: '2rem' }}>
          <h3>Recruiter Tools</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            Candidate and job posting features will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
