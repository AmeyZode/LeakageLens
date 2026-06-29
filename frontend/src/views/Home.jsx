import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ScanSearch, ShieldCheck, Sparkles, Bot, FileText, Gauge } from 'lucide-react';

const FEATURE_CARDS = [
  {
    title: 'Leakage Detection',
    description: 'Find preprocessing and target leakage before deploying your pipeline.',
    icon: ScanSearch,
    color: 'blue'
  },
  {
    title: 'Risk Scoring',
    description: 'Calculate ML pipeline health score based on evaluation and reproducibility issues.',
    icon: Gauge,
    color: 'purple'
  },
  {
    title: 'AI Fix Suggestions',
    description: 'Generate real explanations and code corrections for your ML anti-patterns.',
    icon: Bot,
    color: 'green'
  },
  {
    title: 'Audit Reports',
    description: 'Export detailed, security-grade analysis reports for compliance and auditing.',
    icon: FileText,
    color: 'pink'
  }
];

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
            AI-Powered ML Auditor
          </span>
          <h2>
            Ship reliable ML pipelines with security-grade audits.
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
            Open Audit Cockpit
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="home-signal-grid" aria-label="Security features">
          {FEATURE_CARDS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                className={`home-feature-card home-feature-card--${item.color}`}
                whileHover={{ y: -6, scale: 1.02 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="home-feature-card-glow" aria-hidden="true" />
                <div className="home-feature-icon-wrapper">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}

export default Home;
