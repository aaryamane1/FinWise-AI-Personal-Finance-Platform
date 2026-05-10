import React from 'react';
import { Info, Users, Target, Rocket } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="about-us-page">
      <header className="page-header">
        <div className="page-header-left">
          <div className="eyebrow">Platform</div>
          <h1>About FinWise AI</h1>
        </div>
      </header>

      <div className="grid-2-1">
        <div className="grid-column">
          <section className="card" style={{ marginBottom: '24px' }}>
            <h2 className="section-title">
              <Rocket size={18} /> Our Vision
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
              At FinWise AI, we believe personal finance should be clear, intelligent, and actionable—not confusing, reactive, or buried in spreadsheets. 
              Built by a team of computer science students — Ishan Nerli, Tejas Khandekar, Aarya Mane, and Shreyas Patil — 
              FinWise was created to simplify how people manage money using modern technology and AI.
            </p>
            <br />
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.7' }}>
              Our platform combines budget tracking, net worth monitoring, smart financial insights, and AI-powered analysis into one streamlined experience. 
              Whether you're managing monthly expenses, tracking assets and liabilities, or evaluating financial decisions, FinWise helps users move from guesswork to clarity.
            </p>
          </section>

          <section className="card">
            <h2 className="section-title">
              <Info size={18} /> What Makes FinWise Different
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '20px' }}>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-label" style={{ color: 'var(--green)', marginBottom: '8px' }}>AI-Driven Insights</div>
                <div className="stat-sub">Smarter recommendations, not just static charts</div>
              </div>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-label" style={{ color: 'var(--blue)', marginBottom: '8px' }}>Complete View</div>
                <div className="stat-sub">Expenses, budgets, assets, and liabilities in one place</div>
              </div>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-label" style={{ color: 'var(--purple)', marginBottom: '8px' }}>Modern Tech</div>
                <div className="stat-sub">Built using React, FastAPI, SQLAlchemy, and XGBoost</div>
              </div>
              <div className="stat-card" style={{ padding: '16px' }}>
                <div className="stat-label" style={{ color: 'var(--amber)', marginBottom: '8px' }}>User Focused</div>
                <div className="stat-sub">Fast, responsive, and easy to use design</div>
              </div>
            </div>
          </section>
        </div>

        <div className="grid-column">
          <section className="card" style={{ marginBottom: '24px' }}>
            <h2 className="section-title">
              <Target size={18} /> Our Mission
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>
              "To make wealth management and financial awareness accessible to everyone through intelligent software."
            </p>
          </section>

          <section className="card">
            <h2 className="section-title">
              <Users size={18} /> Our Team
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Created by passionate developers and problem-solvers:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Ishan Nerli', 'Tejas Khandekar', 'Aarya Mane', 'Shreyas Patil'].map(member => (
                <div key={member} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'var(--green-dim)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--green)',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    {member.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{member}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
