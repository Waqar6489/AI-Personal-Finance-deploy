// ============ REPORTS PAGE ============
import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import API from '../api/axios';
import { toast } from '../components/shared/Toast';

Chart.register(...registerables);
const fmt = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const CAT_EMOJI = {Food:'🍔',Transport:'🚗',Utilities:'💡',Healthcare:'🏥',Entertainment:'🎭',Education:'📚',Other:'📦'};
const CAT_COLORS = {Food:'rgba(239,68,68,0.8)',Transport:'rgba(245,158,11,0.8)',Utilities:'rgba(99,120,255,0.8)',Healthcare:'rgba(0,229,196,0.8)',Entertainment:'rgba(255,107,157,0.8)',Education:'rgba(34,197,94,0.8)',Other:'rgba(156,163,175,0.8)'};

export function Reports() {
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date(); firstOfMonth.setDate(1);
  const [from, setFrom] = useState(firstOfMonth.toISOString().split('T')[0]);
  const [to, setTo] = useState(today);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef(); const chartInst = useRef();

  useEffect(() => {
    if (!report || !chartRef.current) return;
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    const cats = Object.entries(report.by_category || {}).sort((a,b)=>b[1].total-a[1].total);
    if (!cats.length) return;
    chartInst.current = new Chart(chartRef.current.getContext('2d'), {
      type:'doughnut',
      data:{ labels: cats.map(c=>c[0]), datasets:[{ data: cats.map(c=>c[1].total), backgroundColor: cats.map(c=>CAT_COLORS[c[0]]||'rgba(156,163,175,0.8)'), borderWidth:2, borderColor:'#161c2e' }]},
      options:{ responsive:true,maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ color:'#7c87b0', font:{size:11}, padding:12 }}}}
    });
    return () => { if(chartInst.current) chartInst.current.destroy(); };
  }, [report]);

  const generate = async () => {
    if(!from||!to){toast('Select date range','warning');return;}
    setLoading(true);
    try {
      const r = await API.get('/reports/financial/', {params:{date_from:from,date_to:to}});
      setReport(r.data);
    } catch { toast('Failed to generate report','error'); }
    finally{setLoading(false);}
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><div className="page-title">Financial Reports</div><div className="page-sub">Generate categorized reports for any date range</div></div>
      </div>
      <div className="form-card">
        <div className="form-card-title">📋 Generate Report</div>
        <div style={{display:'flex',gap:'14px',alignItems:'flex-end',flexWrap:'wrap'}}>
          <div className="form-group" style={{flex:1,minWidth:'140px',marginBottom:0}}>
            <label className="form-label">From Date</label>
            <input className="form-input" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          </div>
          <div className="form-group" style={{flex:1,minWidth:'140px',marginBottom:0}}>
            <label className="form-label">To Date</label>
            <input className="form-input" type="date" value={to} onChange={e=>setTo(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>{loading?'⏳ Generating...':'📋 Generate Report'}</button>
        </div>
      </div>

      {report && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-label">💵 Total Income</div><div className="kpi-val" style={{color:'var(--green)'}}>{fmt(report.total_income)}</div><div className="kpi-change">{report.income_transactions} transactions</div></div>
            <div className="kpi-card"><div className="kpi-label">💸 Total Expenses</div><div className="kpi-val" style={{color:'var(--red)'}}>{fmt(report.total_expenses)}</div><div className="kpi-change">{report.expense_transactions} transactions</div></div>
            <div className="kpi-card"><div className="kpi-label">💰 Net Savings</div><div className="kpi-val" style={{color:report.net_savings>=0?'var(--green)':'var(--red)'}}>{fmt(report.net_savings)}</div></div>
            <div className="kpi-card"><div className="kpi-label">📊 Savings Rate</div><div className="kpi-val">{report.savings_rate}%</div></div>
          </div>
          <div className="chart-grid">
            <div className="chart-card">
              <div className="chart-title">Expense Distribution</div>
              <div className="chart-sub">By category for selected period</div>
              <div className="chart-wrap tall">{Object.keys(report.by_category||{}).length ? <canvas ref={chartRef}/> : <div className="empty-state">No expenses</div>}</div>
            </div>
            <div className="chart-card">
              <div className="chart-title">Income by Source</div>
              <div className="chart-sub">Breakdown of income sources</div>
              <div style={{padding:'8px'}}>
                {Object.entries(report.by_source||{}).map(([src,amt])=>(
                  <div key={src} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                    <span style={{color:'var(--muted)',fontSize:'0.875rem'}}>💼 {src}</span>
                    <span style={{color:'var(--green)',fontWeight:600,fontSize:'0.875rem'}}>{fmt(amt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="table-card">
            <div className="table-header"><div className="table-title">Category Breakdown</div></div>
            <table className="data-table">
              <thead><tr><th>Category</th><th>Transactions</th><th>Total</th><th>Average</th><th>% of Expenses</th></tr></thead>
              <tbody>
                {Object.entries(report.by_category||{}).sort((a,b)=>b[1].total-a[1].total).map(([cat,d])=>(
                  <tr key={cat}>
                    <td><span className="cat-pill" style={{background:CAT_COLORS[cat]+'22',color:CAT_COLORS[cat].replace(',0.8','')}}>{CAT_EMOJI[cat]} {cat}</span></td>
                    <td style={{color:'var(--muted)'}}>{d.count}</td>
                    <td style={{fontWeight:600,color:'var(--red)'}}>{fmt(d.total)}</td>
                    <td style={{color:'var(--muted)'}}>{fmt(d.avg)}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:'8px'}}><div style={{height:'4px',borderRadius:'2px',background:CAT_COLORS[cat],width:`${d.percentage}%`,maxWidth:'60px'}} />{d.percentage}%</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!report && !loading && (
        <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No report generated yet</div><div className="empty-sub">Select a date range and click Generate Report</div></div>
      )}
    </div>
  );
}

// ============ ADMIN PAGE ============
export function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([API.get('/analytics/admin-stats/'), API.get('/auth/admin/users/')]).then(([s, u]) => {
      setStats(s.data); setUsers(u.data.results||u.data);
    }).catch(()=>toast('Admin data load failed','error')).finally(()=>setLoading(false));
  }, []);

  const toggleUser = async (id, active) => {
    try {
      await API.patch(`/auth/admin/users/${id}/`, {is_active: !active});
      setUsers(prev => prev.map(u => u.id===id ? {...u,is_active:!active} : u));
      toast(`User ${!active?'activated':'deactivated'}`);
    } catch { toast('Failed to update user','error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner"/></div>;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><div className="page-title">Admin Panel</div><div className="page-sub">System management and user oversight</div></div>
        <span className="badge badge-red">🔐 Admin Only</span>
      </div>
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--accent)'}}>{stats.total_users}</div><div className="admin-stat-label">Total Users</div></div>
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--green)'}}>{stats.active_users}</div><div className="admin-stat-label">Active Users</div></div>
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--green)',fontSize:'1.3rem'}}>{`Rs. ${Number(stats.total_income).toLocaleString()}`}</div><div className="admin-stat-label">Total Income Tracked</div></div>
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--red)',fontSize:'1.3rem'}}>{`Rs. ${Number(stats.total_expenses).toLocaleString()}`}</div><div className="admin-stat-label">Total Expenses Tracked</div></div>
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--yellow)'}}>{stats.total_transactions}</div><div className="admin-stat-label">Total Transactions</div></div>
          <div className="admin-stat"><div className="admin-stat-val" style={{color:'var(--accent3)'}}>{stats.total_analyses}</div><div className="admin-stat-label">AI Analyses Run</div></div>
        </div>
      )}
      <div className="table-card">
        <div className="table-header"><div className="table-title">User Management</div></div>
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Username</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr></thead>
          <tbody>{users.map(u=>(
            <tr key={u.id}>
              <td style={{fontWeight:500}}>{u.first_name} {u.last_name}</td>
              <td style={{color:'var(--muted)',fontSize:'0.8rem'}}>{u.email}</td>
              <td style={{color:'var(--muted)'}}>{u.username}</td>
              <td><span className={`badge ${u.role==='admin'?'badge-red':'badge-blue'}`}>{u.role}</span></td>
              <td><span className={`badge ${u.is_active?'badge-green':'badge-red'}`}>{u.is_active?'Active':'Inactive'}</span></td>
              <td style={{color:'var(--muted)',fontSize:'0.8rem'}}>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>{u.role!=='admin'&&<button className={`btn btn-sm ${u.is_active?'btn-danger':'btn-success'}`} onClick={()=>toggleUser(u.id,u.is_active)}>{u.is_active?'Deactivate':'Activate'}</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ============ PROFILE PAGE ============
export function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({first_name:'',last_name:'',username:''});
  const [passForm, setPassForm] = useState({old_password:'',new_password:''});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    API.get('/auth/profile/').then(r=>{ setProfile(r.data); setForm({first_name:r.data.first_name,last_name:r.data.last_name,username:r.data.username}); }).finally(()=>setLoading(false));
  },[]);

  const saveProfile = async e => {
    e.preventDefault(); setSaving(true);
    try { const r=await API.patch('/auth/profile/',form); setProfile(r.data); toast('Profile updated'); }
    catch { toast('Failed to update profile','error'); }
    finally{setSaving(false);}
  };

  const changePass = async e => {
    e.preventDefault(); setChangingPass(true);
    try { await API.post('/auth/change-password/',passForm); toast('Password changed successfully'); setPassForm({old_password:'',new_password:''}); }
    catch(e){ toast(e.response?.data?.old_password?.[0]||e.response?.data?.new_password?.[0]||'Failed to change password','error'); }
    finally{setChangingPass(false);}
  };

  if(loading) return <div className="loading-page"><div className="spinner"/></div>;

  const initials = profile?(profile.first_name?.[0]||'')+(profile.last_name?.[0]||''):'U';

  return (
    <div className="fade-in">
      <div className="page-header"><div><div className="page-title">Profile Settings</div><div className="page-sub">Manage your account information</div></div></div>
      <div className="form-card" style={{maxWidth:'560px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'24px'}}>
          <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,var(--accent),var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:'1.4rem',color:'#fff'}}>{initials.toUpperCase()}</div>
          <div>
            <div style={{fontFamily:'var(--font-head)',fontWeight:700,fontSize:'1.1rem'}}>{profile?.first_name} {profile?.last_name}</div>
            <div style={{color:'var(--muted)',fontSize:'0.85rem'}}>{profile?.email}</div>
            <span className={`badge ${profile?.role==='admin'?'badge-red':'badge-blue'}`} style={{marginTop:'4px'}}>{profile?.role}</span>
          </div>
        </div>
        <div className="form-card-title">✏️ Update Profile</div>
        <form onSubmit={saveProfile}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))} required /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" value={form.last_name} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))} required /></div>
          </div>
          <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} required /></div>
          <div className="form-group"><label className="form-label">Email (Read-only)</label><input className="form-input" value={profile?.email||''} readOnly style={{opacity:0.6}} /></div>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving?'⏳ Saving...':'💾 Save Changes'}</button>
        </form>
      </div>
      <div className="form-card" style={{maxWidth:'560px'}}>
        <div className="form-card-title">🔐 Change Password</div>
        <form onSubmit={changePass}>
          <div className="form-group"><label className="form-label">Current Password</label><input className="form-input" type="password" value={passForm.old_password} onChange={e=>setPassForm(p=>({...p,old_password:e.target.value}))} required /></div>
          <div className="form-group"><label className="form-label">New Password (min. 8 chars)</label><input className="form-input" type="password" value={passForm.new_password} onChange={e=>setPassForm(p=>({...p,new_password:e.target.value}))} required /></div>
          <button className="btn btn-ghost" type="submit" disabled={changingPass}>{changingPass?'⏳ Changing...':'🔐 Change Password'}</button>
        </form>
      </div>
      <div className="form-card" style={{maxWidth:'560px',background:'rgba(99,120,255,0.03)'}}>
        <div className="form-card-title">ℹ️ Account Info</div>
        <div style={{display:'grid',gap:'10px'}}>
          {[['Member Since', new Date(profile?.created_at).toLocaleDateString('en-PK',{dateStyle:'long'})],['Account Role',profile?.role],['Account Status',profile?.is_active?'Active':'Inactive']].map(([k,v])=>(
            <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{color:'var(--muted)',fontSize:'0.875rem'}}>{k}</span>
              <span style={{fontWeight:500,fontSize:'0.875rem'}}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
