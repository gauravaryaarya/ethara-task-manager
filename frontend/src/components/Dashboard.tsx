import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotif, setShowNotif] = useState(false);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [view, setView] = useState<'tasks' | 'users'>('tasks');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskComment, setTaskComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [assignedToIds, setAssignedToIds] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState('all');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    initializeDashboard(parsedUser.role);
  }, [navigate]);

  const initializeDashboard = async (role: string) => {
    try {
      const projRes = await API.get('/projects');
      setProjects(projRes.data);
      const userRes = await API.get('/users');
      setUsers(userRes.data);
    } catch (err) {
      setError('System sync failed.');
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (msg: string) => {
    setNotifications(prev => [msg, ...prev]);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'Admin') return;
    try {
      const res = await API.post('/projects', { name: newProjectName });
      setProjects([...projects, res.data]);
      setShowProjectForm(false);
      setNewProjectName('');
      addNotification(`Workspace ${newProjectName} created.`);
    } catch (err) {
      setError('Project creation restricted to Admins.');
    }
  };

  const selectProject = async (project: any) => {
    setActiveProject(project);
    setView('tasks');
    setShowTaskForm(false);
    setMemberFilter('all');
    try {
      const res = await API.get(`/tasks/${project._id}`);
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch project data.');
    }
  };

  const toggleMemberSelection = (id: string) => {
    setAssignedToIds(prev => prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || assignedToIds.length === 0) return;
    try {
      await API.post('/tasks', { 
        title: newTaskTitle, 
        projectId: activeProject._id, 
        assignedTo: assignedToIds, 
        status: 'Pending',
        comment: taskComment,
        attachmentName: selectedFile ? selectedFile.name : null
      });
      const res = await API.get(`/tasks/${activeProject._id}`);
      setTasks(res.data);
      setShowTaskForm(false);
      setNewTaskTitle('');
      setTaskComment('');
      setAssignedToIds([]);
      setSelectedFile(null);
      addNotification(`Task assigned to ${assignedToIds.length} members.`);
    } catch (err) {
      setError('Task allocation failed.');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await API.put(`/tasks/${taskId}`, { status });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status } : t));
      addNotification(`Status updated: ${status}`);
    } catch (err) {
      setError('Update rejected.');
    }
  };

  const filteredTasks = tasks.filter(t => memberFilter === 'all' || t.assignedTo?._id === memberFilter);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading || !user) return <div style={{height:'100vh', background:'#000', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace'}}>SYST_READY...</div>;

  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .app-container { display: flex; height: 100vh; width: 100vw; background: #000; color: #fff; font-family: -apple-system, sans-serif; overflow: hidden; }
    .sidebar { width: 260px; border-right: 1px solid #111; display: flex; flex-direction: column; background: #050505; }
    .main { flex: 1; display: flex; flex-direction: column; position: relative; }
    .header { height: 64px; border-bottom: 1px solid #111; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(0,0,0,0.8); backdrop-filter: blur(12px); z-index: 10; }
    .task-grid { padding: 40px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
    .task-card { background: #0a0a0a; border: 1px solid #1a1a1a; padding: 24px; border-radius: 12px; transition: 0.3s; position: relative; }
    .task-card:hover { border-color: #333; transform: translateY(-4px); }
    .badge { padding: 4px 12px; border-radius: 4px; font-size: 10px; font-weight: 700; border: 1px solid #222; text-transform: uppercase; }
    .btn { background: #fff; color: #000; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
    .btn-dark { background: transparent; color: #fff; border: 1px solid #333; }
    .input-flat { background: transparent; border: none; border-bottom: 1px solid #222; color: #fff; padding: 10px 0; width: 100%; outline: none; margin-bottom: 20px; font-size: 14px; }
    .member-chip { padding: 6px 12px; border: 1px solid #222; border-radius: 4px; cursor: pointer; font-size: 11px; margin: 4px; display: inline-block; }
    .member-chip.selected { background: #fff; color: #000; border-color: #fff; }
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  `;

  return (
    <div className="app-container">
      <style>{css}</style>
      
      {showProjectForm && (
        <div className="modal-overlay">
          <div className="task-card" style={{width:'400px'}}>
            <h2 style={{fontSize:'18px', marginBottom:'20px'}}>NEW WORKSPACE</h2>
            <form onSubmit={handleCreateProject}>
              <input type="text" className="input-flat" placeholder="Project Title" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} required />
              <div style={{display:'flex', gap:'10px'}}>
                <button type="submit" className="btn">Deploy</button>
                <button type="button" className="btn btn-dark" onClick={() => setShowProjectForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="sidebar">
        <div style={{padding:'32px 24px'}}>
          <h1 style={{fontSize:'20px', fontWeight:800, letterSpacing:'-1px'}}>ETHARA AI</h1>
        </div>
        <div style={{flex:1, overflowY:'auto'}}>
          {user.role === 'Admin' && (
            <div style={{padding:'0 16px 20px'}}>
              <div style={{padding:'12px 16px', cursor:'pointer', borderRadius:'8px', background: view === 'users' ? '#1a1a1a' : 'transparent', color: '#fff'}} onClick={() => setView('users')}>Manage Team</div>
            </div>
          )}
          <p style={{padding:'0 24px 12px', fontSize:'11px', color:'#444', fontWeight:700}}>WORKSPACES</p>
          {projects.map(p => (
            <div key={p._id} style={{padding:'12px 24px', cursor:'pointer', color: activeProject?._id === p._id && view === 'tasks' ? '#fff' : '#888', background: activeProject?._id === p._id && view === 'tasks' ? '#111' : 'transparent', fontSize:'14px'}} onClick={() => selectProject(p)}>{p.name}</div>
          ))}
        </div>
        {user.role === 'Admin' && (
          <div style={{padding:'24px', borderTop:'1px solid #111'}}>
            <button className="btn btn-dark" style={{width:'100%'}} onClick={() => setShowProjectForm(true)}>+ New Project</button>
          </div>
        )}
      </div>

      <div className="main">
        {error && (
          <div style={{padding:'10px 40px', background:'#ff4444', color:'#fff', fontSize:'12px', display:'flex', justifyContent:'space-between'}}>
            <span>{error}</span>
            <span style={{cursor:'pointer'}} onClick={() => setError('')}>[CLOSE]</span>
          </div>
        )}

        <div className="header">
          <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
            <div style={{fontWeight:600}}>{activeProject?.name || 'CENTRAL_COMMAND'}</div>
            {user.role === 'Admin' && activeProject && view === 'tasks' && (
              <select value={memberFilter} onChange={e => setMemberFilter(e.target.value)} style={{background:'#000', color:'#888', border:'1px solid #222', fontSize:'10px', padding:'4px'}}>
                <option value="all">FILTER: ALL USERS</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name.toUpperCase()}</option>)}
              </select>
            )}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'24px'}}>
            <button onClick={() => setShowNotif(!showNotif)} style={{background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'11px'}}>LOGS({notifications.length})</button>
            {user.role === 'Admin' && activeProject && view === 'tasks' && <button className="btn" onClick={() => setShowTaskForm(!showTaskForm)}>+ TASK</button>}
            <span style={{fontSize:'12px', color:'#555'}}>{user.name.toUpperCase()}</span>
            <button onClick={handleLogout} style={{background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'11px'}}>EXIT</button>
          </div>
        </div>

        <div className="task-grid">
          {view === 'tasks' && showTaskForm && (
            <div className="task-card" style={{gridColumn:'1/-1'}}>
              <h2 style={{fontSize:'16px', marginBottom:'20px'}}>TASK ALLOCATION</h2>
              <form onSubmit={handleCreateTask}>
                <input type="text" className="input-flat" placeholder="Task Objective" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
                <input type="text" className="input-flat" placeholder="Instructions for team" value={taskComment} onChange={e => setTaskComment(e.target.value)} />
                <div style={{marginBottom:'20px'}}>
                  <p style={{fontSize:'11px', color:'#444', marginBottom:'8px'}}>ATTACHMENTS</p>
                  <input type="file" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} style={{fontSize:'11px'}} />
                </div>
                <div style={{marginBottom:'24px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                    <p style={{fontSize:'11px', color:'#444', fontWeight:700}}>RECIPIENTS</p>
                    <button type="button" style={{fontSize:'10px', background:'none', border:'none', color:'#fff', textDecoration:'underline'}} onClick={() => setAssignedToIds(users.map(u => u._id))}>SELECT ALL</button>
                  </div>
                  {users.map(u => (
                    <div key={u._id} className={`member-chip ${assignedToIds.includes(u._id) ? 'selected' : ''}`} onClick={() => toggleMemberSelection(u._id)}>{u.name}</div>
                  ))}
                </div>
                <div style={{display:'flex', gap:'10px'}}>
                  <button type="submit" className="btn">Deploy Tasks</button>
                  <button type="button" className="btn btn-dark" onClick={() => setShowTaskForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {view === 'tasks' && filteredTasks.map(t => (
            <div key={t._id} className="task-card">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                <span className="badge" style={{color: t.status === 'Completed' ? '#0f0' : '#888', borderColor: t.status === 'Completed' ? '#0f0' : '#888'}}>{t.status}</span>
                <span style={{fontSize:'10px', color:'#333'}}>ID_{t._id.slice(-4)}</span>
              </div>
              <h3 style={{fontSize:'18px', fontWeight:600, marginBottom:'12px'}}>{t.title}</h3>
              <p style={{fontSize:'12px', color:'#555', marginBottom:'16px'}}>Assignee: {t.assignedTo?.name}</p>
              
              {t.attachmentName && (
                <div style={{padding:'8px', background:'#111', border:'1px solid #222', borderRadius:'6px', fontSize:'11px', display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                  {t.attachmentName}
                </div>
              )}

              <div style={{padding:'12px', background:'#050505', borderLeft:'2px solid #222'}}>
                <p style={{fontSize:'11px', color:'#444', fontWeight:700, marginBottom:'4px'}}>ADMIN COMMENTS</p>
                <p style={{fontSize:'13px', color:'#bbb'}}>{t.comment || 'No instructions.'}</p>
              </div>

              <div style={{marginTop:'24px'}}>
                <select value={t.status} onChange={(e) => updateTaskStatus(t._id, e.target.value)} style={{background:'#000', color:'#fff', border:'1px solid #222', padding:'8px', borderRadius:'4px', fontSize:'11px', cursor:'pointer', width:'100%'}}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}