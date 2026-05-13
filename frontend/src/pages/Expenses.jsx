// ============ EXPENSES PAGE ============
import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from '../components/shared/Toast';

const CATS = ['Food','Transport','Utilities','Healthcare','Entertainment','Education','Other'];
const CAT_EMOJI = {Food:'🍔',Transport:'🚗',Utilities:'💡',Healthcare:'🏥',Entertainment:'🎭',Education:'📚',Other:'📦'};
const CAT_COLORS = {Food:'rgba(239,68,68,0.8)',Transport:'rgba(245,158,11,0.8)',Utilities:'rgba(99,120,255,0.8)',Healthcare:'rgba(0,229,196,0.8)',Entertainment:'rgba(255,107,157,0.8)',Education:'rgba(34,197,94,0.8)',Other:'rgba(156,163,175,0.8)'};
const today = () => new Date().toISOString().split('T')[0];
const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

export function Expenses() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({total:0,by_category:{},count:0});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({amount:'',category:'Food',date:today(),description:''});
  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState({month:'',category:''});

  const fetchData = async () => {
    try {
      const params = {};
      if(filter.month) params.month=filter.month;
      if(filter.category) params.category=filter.category;
      const [rec,sum] = await Promise.all([
        API.get('/expenses/',{params}),
        API.get('/expenses/summary/',{params}),
      ]);
      setRecords(rec.data.results||rec.data);
      setSummary(sum.data);
    } catch { toast('Failed to load expenses','error'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{fetchData();},[filter]);
  const set = k=>e=>setForm(p=>({...p,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if(!form.amount||!form.date){toast('Fill all required fields','warning');return;}
    setSubmitting(true);
    try {
      if(editId){ await API.put(`/expenses/${editId}/`,form); toast('Expense updated'); setEditId(null); }
      else { await API.post('/expenses/',form); toast('Expense added'); }
      setForm({amount:'',category:'Food',date:today(),description:''});
      fetchData();
    } catch(e){ toast(e.response?.data?.amount?.[0]||'Failed to save','error'); }
    finally{setSubmitting(false);}
  };

  const startEdit = r => { setEditId(r.id); setForm({amount:r.amount,category:r.category,date:r.date,description:r.description||''}); window.scrollTo(0,0); };
  const deleteRecord = async id => {
    if(!window.confirm('Delete this expense?'))return;
    try{await API.delete(`/expenses/${id}/`);toast('Deleted');fetchData();}
    catch{toast('Failed to delete','error');}
  };
  const cancelEdit = () => {setEditId(null);setForm({amount:'',category:'Food',date:today(),description:''}); };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><div className="page-title">Expense Management</div><div className="page-sub">Track and categorize all your expenses</div></div>
        <div className="header-actions">
          <span className="badge badge-red">Total: {fmt(summary.total)}</span>
          <span className="badge badge-blue">{summary.count} records</span>
        </div>
      </div>
      <div className="form-card">
        <div className="form-card-title">{editId?'✏️ Edit Expense':'➕ Add Expense Record'}</div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Amount (PKR) *</label><input className="form-input" type="number" min="1" placeholder="3500" value={form.amount} onChange={set('amount')} required /></div>
            <div className="form-group"><label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={set('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={set('date')} required /></div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-input" type="text" placeholder="Grocery shopping at store..." value={form.description} onChange={set('description')} /></div>
          </div>
          <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
            <button className="btn btn-danger" type="submit" disabled={submitting}>{submitting?'⏳ Saving...':(editId?'✅ Update':'💾 Save Expense')}</button>
            {editId&&<button className="btn btn-ghost" type="button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </div>
      {Object.keys(summary.by_category||{}).length>0&&(
        <div className="kpi-grid">
          {Object.entries(summary.by_category).sort((a,b)=>b[1]-a[1]).map(([cat,amt])=>(
            <div key={cat} className="kpi-card">
              <div className="kpi-label">{CAT_EMOJI[cat]} {cat}</div>
              <div className="kpi-val" style={{fontSize:'1.3rem',color:'var(--red)'}}>{fmt(amt)}</div>
              <div className="kpi-change">{summary.total>0?((amt/summary.total)*100).toFixed(0):0}% of total</div>
            </div>
          ))}
        </div>
      )}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Expense History</div>
          <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
            <select className="form-select" style={{width:'auto',padding:'6px 10px',fontSize:'0.8rem'}} value={filter.category} onChange={e=>setFilter(p=>({...p,category:e.target.value}))}>
              <option value="">All Categories</option>{CATS.map(c=><option key={c}>{c}</option>)}
            </select>
            <select className="form-select" style={{width:'auto',padding:'6px 10px',fontSize:'0.8rem'}} value={filter.month} onChange={e=>setFilter(p=>({...p,month:e.target.value}))}>
              <option value="">All Months</option>{Array.from({length:12},(_,i)=><option key={i+1} value={i+1}>{new Date(2024,i).toLocaleString('default',{month:'long'})}</option>)}
            </select>
          </div>
        </div>
        {loading?<div className="empty-state"><div className="spinner" style={{margin:'0 auto'}}/></div>:records.length?(
          <table className="data-table">
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Actions</th></tr></thead>
            <tbody>{records.map(r=>(
              <tr key={r.id}>
                <td style={{color:'var(--muted)'}}>{new Date(r.date+'T00:00:00').toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</td>
                <td><span className="cat-pill" style={{background:CAT_COLORS[r.category]+'22',color:CAT_COLORS[r.category].replace(',0.8','')}}>{CAT_EMOJI[r.category]} {r.category}</span></td>
                <td style={{color:'var(--muted)'}}>{r.description||'-'}</td>
                <td style={{color:'var(--red)',fontWeight:600}}>- {fmt(r.amount)}</td>
                <td><div style={{display:'flex',gap:'6px'}}><button className="btn btn-ghost btn-sm" onClick={()=>startEdit(r)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>deleteRecord(r.id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table>
        ):(
          <div className="empty-state"><div className="empty-icon">💸</div><div className="empty-title">No expense records yet</div><div className="empty-sub">Add your first expense using the form above</div></div>
        )}
      </div>
    </div>
  );
}
