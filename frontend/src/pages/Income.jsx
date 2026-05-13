import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from '../components/shared/Toast';

const SOURCES = ['Salary','Freelance','Business','Investment','Rental','Other'];
const today = () => new Date().toISOString().split('T')[0];
const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

export default function Income() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({total:0, by_source:{}, count:0});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ amount:'', source:'Salary', date:today(), description:'' });
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({ month:'', source:'' });

  const fetchData = async () => {
    try {
      const params = {};
      if (filter.month) params.month = filter.month;
      if (filter.source) params.source = filter.source;
      const [rec, sum] = await Promise.all([
        API.get('/income/', { params }),
        API.get('/income/summary/', { params }),
      ]);
      setRecords(rec.data.results || rec.data);
      setSummary(sum.data);
    } catch (e) { toast('Failed to load income data', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const set = k => e => setForm(p => ({...p, [k]: e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) { toast('Please fill all required fields', 'warning'); return; }
    setSubmitting(true);
    try {
      if (editId) {
        await API.put(`/income/${editId}/`, form);
        toast('Income record updated');
        setEditId(null);
      } else {
        await API.post('/income/', form);
        toast('Income record added successfully');
      }
      setForm({ amount:'', source:'Salary', date:today(), description:'' });
      fetchData();
    } catch (e) {
      toast(e.response?.data?.amount?.[0] || 'Failed to save record', 'error');
    } finally { setSubmitting(false); }
  };

  const startEdit = (rec) => {
    setEditId(rec.id);
    setForm({ amount: rec.amount, source: rec.source, date: rec.date, description: rec.description || '' });
    window.scrollTo(0, 0);
  };

  const deleteRecord = async (id) => {
    if (!window.confirm('Delete this income record?')) return;
    try { await API.delete(`/income/${id}/`); toast('Record deleted'); fetchData(); }
    catch { toast('Failed to delete', 'error'); }
  };

  const cancelEdit = () => { setEditId(null); setForm({ amount:'', source:'Salary', date:today(), description:'' }); };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Income Management</div>
          <div className="page-sub">Track and manage all your income sources</div>
        </div>
        <div className="header-actions">
          <span className="badge badge-green">Total: {fmt(summary.total)}</span>
          <span className="badge badge-blue">{summary.count} records</span>
        </div>
      </div>

      {/* ADD/EDIT FORM */}
      <div className="form-card">
        <div className="form-card-title">{editId ? '✏️ Edit Income Record' : '➕ Add Income Record'}</div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Amount (PKR) *</label>
              <input className="form-input" type="number" min="1" placeholder="50000" value={form.amount} onChange={set('amount')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Source *</label>
              <select className="form-select" value={form.source} onChange={set('source')}>
                {SOURCES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" type="text" placeholder="Monthly salary from company..." value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
            <button className="btn btn-success" type="submit" disabled={submitting}>
              {submitting ? '⏳ Saving...' : (editId ? '✅ Update Record' : '💾 Save Income')}
            </button>
            {editId && <button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* SUMMARY CARDS */}
      {Object.keys(summary.by_source||{}).length > 0 && (
        <div className="kpi-grid" style={{marginBottom:'20px'}}>
          {Object.entries(summary.by_source).map(([src, amt]) => (
            <div key={src} className="kpi-card">
              <div className="kpi-label">💼 {src}</div>
              <div className="kpi-val" style={{fontSize:'1.4rem',color:'var(--green)'}}>{fmt(amt)}</div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Income History</div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <select className="form-select" style={{width:'auto',padding:'6px 10px',fontSize:'0.8rem'}} value={filter.source} onChange={e=>setFilter(p=>({...p,source:e.target.value}))}>
              <option value="">All Sources</option>
              {SOURCES.map(s=><option key={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{width:'auto',padding:'6px 10px',fontSize:'0.8rem'}} value={filter.month} onChange={e=>setFilter(p=>({...p,month:e.target.value}))}>
              <option value="">All Months</option>
              {Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(2024,i).toLocaleString('default',{month:'long'})}</option>)}
            </select>
          </div>
        </div>
        {loading ? (
          <div className="empty-state"><div className="spinner" style={{margin:'0 auto'}} /></div>
        ) : records.length ? (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Source</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td style={{color:'var(--muted)'}}>{new Date(r.date+'T00:00:00').toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td><span className="cat-pill" style={{background:'rgba(34,197,94,0.12)',color:'var(--green)'}}>💼 {r.source}</span></td>
                  <td style={{color:'var(--muted)'}}>{r.description || '-'}</td>
                  <td style={{color:'var(--green)',fontWeight:600}}>+ {fmt(r.amount)}</td>
                  <td>
                    <div style={{display:'flex',gap:'6px'}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(r)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>deleteRecord(r.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💵</div>
            <div className="empty-title">No income records yet</div>
            <div className="empty-sub">Add your first income record using the form above</div>
          </div>
        )}
      </div>
    </div>
  );
}
