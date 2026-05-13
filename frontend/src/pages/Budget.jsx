import { useState, useEffect } from 'react';
import API from '../api/axios';
import { toast } from '../components/shared/Toast';

const CATS = ['Food','Transport','Utilities','Healthcare','Entertainment','Education','Other'];
const CAT_EMOJI = {Food:'🍔',Transport:'🚗',Utilities:'💡',Healthcare:'🏥',Entertainment:'🎭',Education:'📚',Other:'📦'};
const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const today = new Date();
  const [selMonth, setSelMonth] = useState(today.getMonth()+1);
  const [selYear, setSelYear] = useState(today.getFullYear());
  const [form, setForm] = useState({category:'Food', monthly_limit:'', month:today.getMonth()+1, year:today.getFullYear()});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bud, stat] = await Promise.all([
        API.get('/budgets/', {params:{month:selMonth, year:selYear}}),
        API.get('/budgets/status/', {params:{month:selMonth, year:selYear}}),
      ]);
      setBudgets(bud.data.results||bud.data);
      setStatus(stat.data);
    } catch { toast('Failed to load budgets','error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selMonth, selYear]);

  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    if(!form.monthly_limit){toast('Enter budget limit','warning');return;}
    setSubmitting(true);
    try {
      await API.post('/budgets/', {...form, month:selMonth, year:selYear});
      toast(`Budget set for ${form.category}`);
      setForm(p=>({...p,monthly_limit:''}));
      fetchData();
    } catch(e){
      const msg = e.response?.data?.non_field_errors?.[0]||e.response?.data?.monthly_limit?.[0]||'Failed to set budget';
      toast(msg,'error');
    }
    finally{setSubmitting(false);}
  };

  const deleteBudget = async id => {
    if(!window.confirm('Remove this budget?'))return;
    try{await API.delete(`/budgets/${id}/`);toast('Budget removed');fetchData();}
    catch{toast('Failed to remove','error');}
  };

  const getProgClass = pct => pct>=100?'prog-red':pct>=80?'prog-yellow':'prog-green';
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div><div className="page-title">Budget Management</div><div className="page-sub">Set and monitor monthly spending limits per category</div></div>
        <div className="header-actions">
          <select className="form-select" style={{width:'auto',padding:'7px 12px',fontSize:'0.85rem'}} value={selMonth} onChange={e=>setSelMonth(Number(e.target.value))}>
            {MONTH_NAMES.map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="form-select" style={{width:'auto',padding:'7px 12px',fontSize:'0.85rem'}} value={selYear} onChange={e=>setSelYear(Number(e.target.value))}>
            {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="form-card">
        <div className="form-card-title">🎯 Set Monthly Budget</div>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={set('category')}>{CATS.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Limit (PKR) *</label>
              <input className="form-input" type="number" min="1" placeholder="10000" value={form.monthly_limit} onChange={set('monthly_limit')} required />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>{submitting?'⏳ Setting...':'🎯 Set Budget'}</button>
        </form>
      </div>

      {/* BUDGET STATUS */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Budget Status — {MONTH_NAMES[selMonth-1]} {selYear}</div>
          <div style={{display:'flex',gap:'8px'}}>
            <span className="badge badge-green">✅ OK</span>
            <span className="badge badge-yellow">⚠️ Warning (80%+)</span>
            <span className="badge badge-red">🚨 Exceeded (100%+)</span>
          </div>
        </div>
        {loading ? <div className="empty-state"><div className="spinner" style={{margin:'0 auto'}}/></div>
        : status.length ? status.map(b => (
          <div key={b.id} className="budget-item">
            <div className="budget-row">
              <div className="budget-cat">
                {CAT_EMOJI[b.category]} {b.category}
                {b.status==='exceeded'&&<span className="badge badge-red">🚨 Exceeded by {fmt(Number(b.spent)-Number(b.monthly_limit))}</span>}
                {b.status==='warning'&&<span className="badge badge-yellow">⚠️ Near Limit</span>}
              </div>
              <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
                <div className="budget-amounts">Spent: {fmt(b.spent)} / Limit: {fmt(b.monthly_limit)}</div>
                <button className="btn btn-danger btn-sm" onClick={()=>deleteBudget(b.id)}>✕</button>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
              <div className="progress-bar" style={{flex:1}}>
                <div className={`progress-fill ${getProgClass(b.percentage)}`} style={{width:`${Math.min(b.percentage,100)}%`}} />
              </div>
              <span style={{fontSize:'0.78rem',color:b.status==='exceeded'?'var(--red)':b.status==='warning'?'var(--yellow)':'var(--muted)',minWidth:'36px',textAlign:'right'}}>{b.percentage}%</span>
            </div>
            {b.status==='ok'&&<div style={{fontSize:'0.75rem',color:'var(--green)',marginTop:'4px'}}>Remaining: {fmt(b.remaining)}</div>}
          </div>
        )) : (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No budgets set for {MONTH_NAMES[selMonth-1]} {selYear}</div>
            <div className="empty-sub">Use the form above to set spending limits per category</div>
          </div>
        )}
      </div>

      {/* TIPS */}
      <div className="form-card" style={{background:'rgba(99,120,255,0.04)'}}>
        <div className="form-card-title">💡 Budget Tips</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {[
            {e:'🟢', t:'Green (0–79%)', d:'Spending within healthy limits. Keep it up!'},
            {e:'🟡', t:'Yellow (80–99%)', d:'Approaching budget limit. Slow down spending.'},
            {e:'🔴', t:'Red (100%+)', d:'Budget exceeded! Review and adjust immediately.'},
            {e:'🎯', t:'50/30/20 Rule', d:'50% needs, 30% wants, 20% savings — a proven framework.'},
          ].map(t=>(
            <div key={t.t} style={{padding:'12px',background:'var(--card)',borderRadius:'9px',border:'1px solid var(--border)'}}>
              <div style={{fontWeight:600,fontSize:'0.85rem',marginBottom:'4px'}}>{t.e} {t.t}</div>
              <div style={{fontSize:'0.78rem',color:'var(--muted)'}}>{t.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
