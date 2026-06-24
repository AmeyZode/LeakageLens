import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ScanSearch, ShieldCheck, Sparkles } from 'lucide-react';

function Home({ onNavigate, userToken }) {
  return (
    <motion.div
      className="home-view"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <section className="home-hero security-surface">
        <div className="home-copy">
          <span className="hero-kicker">
            <Sparkles size={14} aria-hidden="true" />
            AI-powered ML auditor
          </span>
          <h2>
            Ship cleaner ML pipelines with a security-grade audit cockpit.
          </h2>
          <p>
            LeakageLens scans pipeline code for leakage, reproducibility gaps, evaluation mistakes,
            and anti-patterns before they reach production.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate(userToken ? '/dashboard' : '/login')}
          >
            Open Dashboard
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="home-signal-grid" aria-label="Security signals">
          {[
            { label: 'Leakage scan', icon: ScanSearch },
            { label: 'Risk scoring', icon: ShieldCheck },
            { label: 'AI fixes', icon: Sparkles },
            { label: 'Ready report', icon: CheckCircle2 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="home-signal-card">
                <Icon size={20} aria-hidden="true" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default Home;
