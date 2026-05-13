import { Link } from 'react-router-dom';

const CAT_EMOJIS = { Food:'🍔', Transport:'🚗', Utilities:'💡', Healthcare:'🏥', Entertainment:'🎭', Education:'📚', Other:'📦' };

export default function Landing() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a className="nav-logo" href="#">
          <div className="logo-icon">💰</div>
          <div>
            <div>AI Personal Finance</div>
            <div style={{fontSize:'0.62rem',color:'var(--muted)',fontWeight:400}}>Smart Finance Platform</div>
          </div>
        </a>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#about">About</a></li>
        </ul>
        <div className="nav-actions">
          <Link to="/login" className="btn btn-ghost" style={{textDecoration: "none"}}>Log In</Link>
          <Link to="/register" className="btn btn-primary" style={{textDecoration: "none"}}>Get Started Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-badge fade-up">🎓 Riphah International University — FYP 2026</div>
        <h1 className="fade-up" style={{animationDelay:'0.1s'}}>
          Smart Finance,<br /><span>Powered by AI</span>
        </h1>
        <p className="fade-up" style={{animationDelay:'0.2s'}}>
          Track income, manage expenses, and get personalized AI insights to achieve your financial goals — all in one intelligent platform built for Pakistan.
        </p>
        <div className="hero-actions fade-up" style={{animationDelay:'0.3s'}}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{textDecoration: "none"}}>Start Free Today</Link>
          <Link to="/login" className="btn btn-ghost btn-lg" style={{textDecoration: "none"}}>Login</Link>
        </div>
        <div className="hero-stats fade-up" style={{animationDelay:'0.4s'}}>
          {[
            {val:'5K', accent:'+', label:'Active Users'},
            {val:'Rs.', accent:'2M', label:'Tracked Monthly'},
            {val:'', accent:'95%', label:'Accuracy Rate'},
            {val:'', accent:'15%', label:'Avg. Savings Increase'},
          ].map((s, i) => (
            <div key={i} style={{textAlign:'center'}}>
              <div className="stat-value">{s.val}<span className="accent">{s.accent}</span></div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-center">
            <div className="section-tag">What We Offer</div>
            <h2 className="section-title">Everything You Need to <span className="hl">Take Control</span></h2>
            <p className="section-sub">From tracking to prediction — your complete financial intelligence hub</p>
          </div>
          <div className="features-grid">
            {[
              {icon:'🤖', title:'AI-Powered Insights', desc:'Scikit-learn models analyze your spending patterns and generate personalized recommendations like "Reduce food spending by 10% to save Rs. 2,230."'},
              {icon:'📊', title:'Visual Dashboard', desc:'Beautiful Chart.js-powered dashboards show your income, expenses, and savings trends at a glance — no spreadsheets needed.'},
              {icon:'🎯', title:'Budget Tracking', desc:'Set monthly budgets per category and get real-time alerts when you\'re approaching your limits. Stay in control, always.'},
              {icon:'🔮', title:'Expense Prediction', desc:'Our ML model forecasts next month\'s expenses based on your historical behavior, so you can plan ahead with confidence.'},
              {icon:'🔒', title:'Secure & Private', desc:'Django backend with JWT auth, PBKDF2 password hashing, HTTPS/TLS, CSRF protection. Your data is encrypted and isolated.'},
              {icon:'📱', title:'Responsive Design', desc:'Built with React for a seamless experience on mobile, tablet, and desktop. Manage your finances from anywhere.'},
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:'var(--bg)',padding:'100px 20px'}} id="how">
        <div className="container">
          <div className="section-center">
            <div className="section-tag">Simple Process</div>
            <h2 className="section-title">How It <span className="hl">Works</span></h2>
          </div>
          <div className="steps">
            {[
              {n:'1', title:'Create Account', desc:'Sign up securely and set up your financial profile in under 2 minutes.'},
              {n:'2', title:'Log Transactions', desc:'Add income and expenses with categories. The system auto-categorizes recurring transactions.'},
              {n:'3', title:'AI Analyzes', desc:'Pandas & Scikit-learn run behind the scenes to detect patterns in your financial data.'},
              {n:'4', title:'Get Insights', desc:'Receive actionable recommendations and visual reports to improve your financial health.'},
            ].map((s, i) => (
              <div key={i} className="step">
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECH STRIP */}
      <div className="tech-strip">
        <div className="tech-strip-inner">
          <span className="tech-label">Built With</span>
          <div className="tech-chips">
            {['⚛️ React','🐍 Django','🔬 Scikit-learn','📈 Chart.js','🗄️ MySQL','🐼 Pandas','🔢 NumPy'].map(t => (
              <span key={t} className="tech-chip">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <div className="section-tag">About Us</div>
              <h2 className="section-title">Built by Students, <span className="hl">For Everyone</span></h2>
              <p>AI Personal Finance is a Final Year Project by BSSE students at Riphah International University, Faisalabad Campus, supervised by Mam Mariam Afzal.</p>
              <p>Managing personal finances is difficult due to poor financial awareness and lack of intelligent tools. Our system uses AI libraries (NumPy, Pandas, Scikit-learn) to analyze spending patterns and provide personalized recommendations.</p>
              <p>The system improves financial awareness and supports better financial decision-making — especially for students and young professionals in Pakistan.</p>
            </div>
            <div>
              <p style={{fontSize:'0.75rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'14px'}}>Development Team</p>
              <div className="team-cards">
                {[
                  {init:'WA', name:'Waqar Ali', id:'Roll No. 24421', bg:'linear-gradient(135deg,#6378ff,#8b5cf6)'},
                  {init:'MH', name:'Muhammad Hamid', id:'Roll No. 25951', bg:'linear-gradient(135deg,#00e5c4,#06b6d4)'},
                  {init:'ZG', name:'Zohaib Gulzar', id:'Roll No. 26183', bg:'linear-gradient(135deg,#ff6b9d,#f43f5e)'},
                  {init:'MA', name:'Mam Mariam Afzal', id:'Supervisor', bg:'linear-gradient(135deg,#f59e0b,#d97706)', extra:{marginTop:'8px',background:'rgba(99,120,255,0.06)'}},
                ].map((m, i) => (
                  <div key={i} className="team-card" style={m.extra}>
                    <div className="team-avatar" style={{background:m.bg}}>{m.init}</div>
                    <div><div className="team-name">{m.name}</div><div className="team-id">{m.id}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-text">© 2024 Riphah International University, Faisalabad — BSSE Final Year Project</div>
        <a className="nav-logo" href="#" style={{fontSize:'0.9rem'}}>
          <div className="logo-icon" style={{width:28,height:28,fontSize:14}}>💰</div>
          AI Personal Finance
        </a>
        <div className="footer-text">Waqar Ali · Muhammad Hamid · Zohaib Gulzar</div>
      </footer>
    </>
  );
}
