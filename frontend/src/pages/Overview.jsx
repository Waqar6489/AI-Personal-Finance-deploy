import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import API from '../api/axios';

Chart.register(...registerables);

const CAT_COLORS = {
  Food:'rgba(239,68,68,0.8)', Transport:'rgba(245,158,11,0.8)',
  Utilities:'rgba(99,120,255,0.8)', Healthcare:'rgba(0,229,196,0.8)',
  Entertainment:'rgba(255,107,157,0.8)', Education:'rgba(34,197,94,0.8)',
  Other:'rgba(156,163,175,0.8)'
};
const CAT_EMOJI = { Food:'🍔', Transport:'🚗', Utilities:'💡', Healthcare:'🏥', Entertainment:'🎭', Education:'📚', Other:'📦' };

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmt(num) { return `Rs. ${Number(num).toLocaleString('en-PK', {minimumFractionDigits:0, maximumFractionDigits:0})}`; }

export default function Overview() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const pieRef = useRef(); const barRef = useRef(); const lineRef = useRef();
  const pieChart = useRef(); const barChart = useRef(); const lineChart = useRef();

  const today = new Date();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, incRes, expRes] = await Promise.all([
          API.get(`/analytics/dashboard/?month=${today.getMonth()+1}&year=${today.getFullYear()}`),
          API.get(`/income/?month=${today.getMonth()+1}&year=${today.getFullYear()}`),
          API.get(`/expenses/?month=${today.getMonth()+1}&year=${today.getFullYear()}`),
        ]);
        setData(dashRes.data);
        const allTrans = [
          ...(incRes.data.results || incRes.data).map(i => ({...i, type:'income', cat:'Income'})),
          ...(expRes.data.results || expRes.data).map(e => ({...e, type:'expense', cat:e.category})),
        ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
        setTransactions(allTrans);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;
    const catData = data.by_category || {};
    const cats = Object.keys(catData);
    const trend = data.monthly_trend || [];

    // Destroy existing
    [pieChart, barChart, lineChart].forEach(r => { if(r.current) { r.current.destroy(); r.current = null; }});

    const chartOpts = (yPrefix='Rs.') => ({
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color:'#7c87b0', font:{size:11} } } },
      scales: {
        x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#7c87b0',font:{size:10}} },
        y: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'#7c87b0',font:{size:10}, callback: v => yPrefix+v.toLocaleString()} }
      }
    });

    if (pieRef.current && cats.length) {
      pieChart.current = new Chart(pieRef.current.getContext('2d'), {
        type: 'doughnut',
        data: { labels: cats, datasets: [{ data: cats.map(c=>catData[c]), backgroundColor: cats.map(c=>CAT_COLORS[c]||'rgba(156,163,175,0.8)'), borderWidth:2, borderColor:'#161c2e' }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom', labels:{color:'#7c87b0',font:{size:10},padding:10} } } }
      });
    }

    if (barRef.current && trend.length) {
      const labels = trend.map(t => MONTH_NAMES[t.month-1]);
      barChart.current = new Chart(barRef.current.getContext('2d'), {
        type: 'bar',
        data: { labels,
          datasets: [
            { label:'Income', data: trend.map(t=>t.income), backgroundColor:'rgba(34,197,94,0.7)', borderRadius:5 },
            { label:'Expenses', data: trend.map(t=>t.expenses), backgroundColor:'rgba(239,68,68,0.7)', borderRadius:5 },
          ]
        },
        options: chartOpts()
      });
    }

    if (lineRef.current && trend.length) {
      const labels = trend.map(t => MONTH_NAMES[t.month-1]);
      lineChart.current = new Chart(lineRef.current.getContext('2d'), {
        type: 'line',
        data: { labels,
          datasets: [
            { label:'Income', data: trend.map(t=>t.income), borderColor:'rgba(34,197,94,0.9)', backgroundColor:'rgba(34,197,94,0.08)', tension:0.4, fill:true, pointRadius:4 },
            { label:'Expenses', data: trend.map(t=>t.expenses), borderColor:'rgba(239,68,68,0.9)', backgroundColor:'rgba(239,68,68,0.08)', tension:0.4, fill:true, pointRadius:4 },
            { label:'Savings', data: trend.map(t=>t.savings), borderColor:'rgba(99,120,255,0.9)', backgroundColor:'rgba(99,120,255,0.08)', tension:0.4, fill:true, pointRadius:4 },
          ]
        },
        options: chartOpts()
      });
    }

    return () => { [pieChart, barChart, lineChart].forEach(r => { if(r.current) r.current.destroy(); }); };
  }, [data]);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  const d = data || {};
  const budPct = d.budget_used_pct || 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard Overview</div>
          <div className="page-sub">Welcome back! Here's your financial summary for {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</div>
        </div>
        <div className="header-actions">
          <span className="badge badge-blue">{MONTH_NAMES[today.getMonth()]} {today.getFullYear()}</span>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">💵 Total Income</div>
          <div className="kpi-val" style={{color:'var(--green)'}}>{fmt(d.total_income||0)}</div>
          <div className="kpi-change up">↑ This month</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">💸 Total Expenses</div>
          <div className="kpi-val" style={{color:'var(--red)'}}>{fmt(d.total_expenses||0)}</div>
          <div className="kpi-change down">↓ Tracked spending</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">💰 Net Savings</div>
          <div className="kpi-val" style={{color: (d.net_savings||0) >= 0 ? 'var(--green)' : 'var(--red)'}}>{fmt(d.net_savings||0)}</div>
          <div className={`kpi-change ${(d.savings_rate||0) >= 20 ? 'up' : ''}`}>Savings Rate: {d.savings_rate||0}%</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">📊 Budget Used</div>
          <div className="kpi-val" style={{color: budPct>=100?'var(--red)':budPct>=80?'var(--yellow)':'var(--text)'}}>{budPct}%</div>
          <div className="kpi-change">Of monthly budget</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Expense by Category</div>
          <div className="chart-sub">Current month breakdown</div>
          <div className="chart-wrap">
            {Object.keys(d.by_category||{}).length ? <canvas ref={pieRef} /> : (
              <div className="empty-state"><div className="empty-icon">📊</div><div>No expenses this month</div></div>
            )}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Income vs Expenses</div>
          <div className="chart-sub">6-month comparison</div>
          <div className="chart-wrap"><canvas ref={barRef} /></div>
        </div>
        <div className="chart-card wide">
          <div className="chart-title">Financial Trend</div>
          <div className="chart-sub">6-month income, expenses & savings overview</div>
          <div className="chart-wrap tall"><canvas ref={lineRef} /></div>
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="table-card">
        <div className="table-header">
          <div className="table-title">Recent Transactions</div>
          <span style={{fontSize:'0.78rem',color:'var(--muted)'}}>{transactions.length} this month</span>
        </div>
        {transactions.length ? (
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id+t.type}>
                  <td style={{color:'var(--muted)'}}>{new Date(t.date+'T00:00:00').toLocaleDateString('en-PK',{day:'numeric',month:'short'})}</td>
                  <td>{t.description || t.source || t.category}</td>
                  <td>
                    <span className="cat-pill" style={{background: t.type==='income'?'rgba(34,197,94,0.12)':'rgba(99,120,255,0.12)', color: t.type==='income'?'var(--green)':'var(--muted)'}}>
                      {t.type==='income'?'💵':CAT_EMOJI[t.cat]||'📦'} {t.type==='income'?t.source:t.cat}
                    </span>
                  </td>
                  <td><span className={`badge ${t.type==='income'?'badge-green':'badge-red'}`}>{t.type}</span></td>
                  <td style={{fontWeight:600, color: t.type==='income'?'var(--green)':'var(--red)'}}>
                    {t.type==='income'?'+':'-'} {fmt(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No transactions yet</div>
            <div className="empty-sub">Add income or expenses to see them here</div>
          </div>
        )}
      </div>
    </div>
  );
}
