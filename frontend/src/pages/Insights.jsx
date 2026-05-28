import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import API from '../api/axios';
import { toast } from '../components/shared/Toast';



Chart.register(...registerables);
const fmt = (n) => `Rs. ${Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:0})}`;
const CATS = ['Food','Transport','Utilities','Healthcare','Entertainment','Education','Other'];
const CAT_COLORS = {Food:'rgba(239,68,68,0.8)',Transport:'rgba(245,158,11,0.8)',Utilities:'rgba(99,120,255,0.8)',Healthcare:'rgba(0,229,196,0.8)',Entertainment:'rgba(255,107,157,0.8)',Education:'rgba(34,197,94,0.8)',Other:'rgba(156,163,175,0.8)'};
const INSIGHT_BG = {pattern:'rgba(99,120,255,0.1)',spending:'rgba(239,68,68,0.1)',anomaly:'rgba(239,68,68,0.1)',prediction:'rgba(0,229,196,0.08)',success:'rgba(34,197,94,0.1)',warning:'rgba(245,158,11,0.1)',alert:'rgba(239,68,68,0.1)',tip:'rgba(245,158,11,0.08)',info:'rgba(99,120,255,0.08)'};

export default function Insights() {
  const [analysis, setAnalysis] = useState(null);
  const [running, setRunning] = useState(false);
  const [latest, setLatest] = useState(null);
  const predictRef = useRef(); const anomalyRef = useRef();
  const predictChart = useRef(); const anomalyChart = useRef();

  useEffect(() => {
    API.get('/analytics/latest/').then(r => { setLatest(r.data); setAnalysis(r.data); }).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!analysis) return;
    [predictChart, anomalyChart].forEach(r => { if(r.current) { r.current.destroy(); r.current = null; }});
    const preds = analysis.predictions || {};
    const catPredData = CATS.map(c => preds[c]||0);
    const patterns = analysis.patterns || {};
    const catActData = CATS.map(c => patterns[c]?.total||0);

    if (predictRef.current) {
      predictChart.current = new Chart(predictRef.current.getContext('2d'), {
        type:'bar',
        data:{ labels:CATS,
          datasets:[
            {label:'Actual (Current)', data:catActData, backgroundColor:'rgba(99,120,255,0.7)', borderRadius:5},
            {label:'Predicted (Next Month)', data:catPredData, backgroundColor:'rgba(255,107,157,0.7)', borderRadius:5},
          ]
        },
        options:{ responsive:true,maintainAspectRatio:false, plugins:{legend:{labels:{color:'#7c87b0',font:{size:11}}}}, scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#7c87b0',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#7c87b0',font:{size:10},callback:v=>'Rs.'+v.toLocaleString()}}}}
      });
    }

    if (anomalyRef.current) {
      const anomalies = analysis.anomalies || [];
      const normalData = CATS.map(c=>({x:c,y:patterns[c]?.average||0}));
      const anomData = anomalies.map(a=>({x:a.category, y:a.amount, label:a.description}));
      anomalyChart.current = new Chart(anomalyRef.current.getContext('2d'), {
        type:'bar',
        data:{ labels:CATS,
          datasets:[
            {label:'Avg Spending', data:CATS.map(c=>patterns[c]?.average||0), backgroundColor:'rgba(34,197,94,0.6)', borderRadius:5},
            {label:'Anomalies', data:CATS.map(c=>{ const a=anomalies.find(x=>x.category===c); return a?a.amount:null; }), backgroundColor:'rgba(239,68,68,0.8)', borderRadius:5},
          ]
        },
        options:{ responsive:true,maintainAspectRatio:false, plugins:{legend:{labels:{color:'#7c87b0',font:{size:11}}}}, scales:{x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#7c87b0',font:{size:10}}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#7c87b0',font:{size:10},callback:v=>'Rs.'+v.toLocaleString()}}}}
      });
    }
    return () => { [predictChart, anomalyChart].forEach(r=>{if(r.current)r.current.destroy();}); };
  }, [analysis]);

  const runAnalysis = async () => {
    setRunning(true);
    try {
      const res = await API.post('/analytics/run/');
      setAnalysis(res.data);
      toast('🤖 AI Analysis complete!');
    } catch { toast('Analysis failed. Add some data first.','error'); }
    finally { setRunning(false); }
  };

  const insights = analysis?.insights || [];
  const preds = analysis?.predictions || {};
  const summary = analysis?.summary || {};

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="page-title">AI Insights</div>
          <div className="page-sub">ML-powered spending analysis — Linear Regression, K-Means, Isolation Forest</div>
        </div>
        <div className="header-actions">
          {analysis && <span className="badge badge-blue">Last run: {new Date(analysis.analysis_date).toLocaleDateString()}</span>}
          <button className="btn btn-primary" onClick={runAnalysis} disabled={running}>
            {running ? '⏳ Analyzing...' : '🤖 Run Analysis'}
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {summary.total_income !== undefined && (
        <div className="kpi-grid">
          <div className="kpi-card"><div className="kpi-label">💵 Total Income</div><div className="kpi-val" style={{color:'var(--green)'}}>{fmt(summary.total_income)}</div></div>
          <div className="kpi-card"><div className="kpi-label">💸 Total Expenses</div><div className="kpi-val" style={{color:'var(--red)'}}>{fmt(summary.total_expenses)}</div></div>
          <div className="kpi-card"><div className="kpi-label">💰 Net Savings</div><div className="kpi-val" style={{color:summary.net_savings>=0?'var(--green)':'var(--red)'}}>{fmt(summary.net_savings)}</div></div>
          <div className="kpi-card"><div className="kpi-label">📊 Savings Rate</div><div className="kpi-val">{summary.savings_rate||0}%</div><div className="kpi-change">{summary.savings_rate>=20?'✅ On track':'Target: 20%'}</div></div>
        </div>
      )}

      {/* CHARTS */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">🔮 Prediction: Actual vs Next Month</div>
          <div className="chart-sub">Linear Regression forecast by category</div>
          <div className="chart-wrap"><canvas ref={predictRef} /></div>
        </div>
        <div className="chart-card">
          <div className="chart-title">🚨 Anomaly Detection</div>
          <div className="chart-sub">Isolation Forest — avg vs anomalous transactions</div>
          <div className="chart-wrap"><canvas ref={anomalyRef} /></div>
        </div>
      </div>

      {/* PREDICTIONS SUMMARY */}
      {preds.next_month_total && (
        <div className="form-card" style={{background:'rgba(0,229,196,0.04)',marginBottom:'20px'}}>
          <div className="form-card-title">🔮 Next Month Predictions (Linear Regression)</div>
          <div className="kpi-grid">
            <div className="kpi-card"><div className="kpi-label">📈 Predicted Expenses</div><div className="kpi-val" style={{fontSize:'1.4rem',color:'var(--accent)'}}>{fmt(preds.next_month_total)}</div></div>
            {preds.predicted_savings!==undefined && <div className="kpi-card"><div className="kpi-label">💰 Predicted Savings</div><div className="kpi-val" style={{fontSize:'1.4rem',color:preds.predicted_savings>=0?'var(--green)':'var(--red)'}}>{fmt(preds.predicted_savings)}</div></div>}
          </div>
        </div>
      )}

      {/* INSIGHTS LIST */}
      <div>
        {insights.length ? insights.map((ins, i) => (
          <div key={i} className="insight-card">
            <div className="insight-icon" style={{background:INSIGHT_BG[ins.type]||'rgba(99,120,255,0.1)'}}>{ins.icon}</div>
            <div style={{flex:1}}>
              <div className="insight-title">{ins.title}</div>
              <div className="insight-desc">{ins.description}</div>
            </div>
          </div>
        )) : (
          <div className="insight-card">
            <div className="insight-icon" style={{background:'rgba(99,120,255,0.1)'}}>🤖</div>
            <div>
              <div className="insight-title">Run AI Analysis to Get Insights</div>
              <div className="insight-desc">Click "Run Analysis" above to generate personalized financial insights using our ML pipeline: K-Means Clustering for spending patterns, Isolation Forest for anomaly detection, and Linear Regression for expense forecasting.</div>
              <div className="insight-meta">🔬 Requires income and expense data</div>
            </div>
          </div>
        )}
      </div>

      {/* ML PIPELINE INFO */}
      <div className="form-card" style={{background:'rgba(99,120,255,0.03)',marginTop:'20px'}}>
        <div className="form-card-title">🔬 AI Analytics Pipeline (SRS Section 4.2.4)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          {[
            {stage:'Stage 1',title:'Data Preprocessing',desc:'Pandas DataFrame — missing value handling, normalization, categorical encoding',color:'var(--accent)'},
            {stage:'Stage 2',title:'Pattern Analysis',desc:'K-Means Clustering (Scikit-learn) — spending behavior segmentation',color:'var(--accent2)'},
            {stage:'Stage 3',title:'Anomaly Detection',desc:'Isolation Forest + Z-score — unusual transaction identification',color:'var(--red)'},
            {stage:'Stage 4',title:'Predictive Forecasting',desc:'Linear Regression (Scikit-learn) — next month expense prediction',color:'var(--accent3)'},
            {stage:'Stage 5',title:'Recommendations',desc:'Natural language insights generated from ML analytical outputs',color:'var(--green)'},
          ].map(s=>(
            <div key={s.stage} style={{padding:'12px',background:'var(--card)',borderRadius:'9px',border:'1px solid var(--border)'}}>
              <div style={{fontSize:'0.68rem',color:s.color,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'4px'}}>{s.stage}</div>
              <div style={{fontWeight:600,fontSize:'0.85rem',marginBottom:'4px'}}>{s.title}</div>
              <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
