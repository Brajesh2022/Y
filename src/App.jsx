import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Shield, 
  Infinity, 
  Cpu, 
  Globe, 
  Lock, 
  ArrowRight, 
  Terminal, 
  Database, 
  Layers,
  ChevronRight,
  X,
  Menu
} from 'lucide-react';

/**
 * THE SILICON FOREST AESTHETIC
 * - Background: Deep Forest Charcoal (#0A0F0B)
 * - Accent: Electric Lime (#CCFF00)
 * - Secondary: Industrial Slate (#1A221C)
 * - Typography: Unbounded (Headlines), JetBrains Mono (Body/Data)
 */

const App = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0F0B] text-[#E0E7E1] font-mono selection:bg-[#CCFF00] selection:text-[#0A0F0B]">
      {/* Dynamic Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `radial-gradient(#CCFF00 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }}>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 border-b ${scrolled ? 'bg-[#0A0F0B]/90 backdrop-blur-xl border-[#CCFF00]/30 py-4' : 'bg-transparent border-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#CCFF00] flex items-center justify-center rotate-45 group hover:rotate-90 transition-transform duration-500">
              <div className="w-4 h-4 bg-[#0A0F0B] -rotate-45"></div>
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase font-sans">Edge<span className="text-[#CCFF00]">Architect</span></span>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest">
            {['Performance', 'Security', 'The Cost', 'Stack'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '')}`} className="hover:text-[#CCFF00] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#CCFF00] transition-all group-hover:w-full"></span>
              </a>
            ))}
            <button className="bg-[#CCFF00] text-[#0A0F0B] px-6 py-2 border-2 border-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] transition-all duration-300">
              Build Now
            </button>
          </div>

          <button className="md:hidden text-[#CCFF00]" onClick={() => setMobileMenu(true)}>
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#0A0F0B] z-[100] transition-transform duration-700 p-8 ${mobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-20">
          <span className="text-xl font-bold text-[#CCFF00]">MENU</span>
          <button onClick={() => setMobileMenu(false)} className="text-[#CCFF00]"><X size={40} /></button>
        </div>
        <div className="flex flex-col gap-8 text-4xl font-black italic">
          <a href="#" onClick={() => setMobileMenu(false)}>PERFORMANCE</a>
          <a href="#" onClick={() => setMobileMenu(false)}>SECURITY</a>
          <a href="#" onClick={() => setMobileMenu(false)}>THE COST</a>
          <a href="#" onClick={() => setMobileMenu(false)}>STACK</a>
        </div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-block px-4 py-1 mb-6 border border-[#CCFF00] text-[#CCFF00] text-xs font-bold tracking-[0.3em] animate-pulse">
            SYSTEM STATUS: OPERATIONAL // EDGE_MODE
          </div>
          <h1 className="text-6xl md:text-[9rem] font-black leading-[0.85] tracking-tighter uppercase mb-12">
            Kill the <br />
            <span className="text-[#CCFF00] italic">hosting</span> <br />
            Bill.
          </h1>
          <div className="grid md:grid-cols-2 gap-12 items-end">
            <p className="text-xl md:text-2xl text-[#E0E7E1]/70 leading-relaxed max-w-xl font-sans">
              We build high-performance React applications that run on global edge networks. 
              Zero server management. Zero monthly hosting fees. 
              <span className="text-[#CCFF00]"> 100% Ownership.</span>
            </p>
            <div className="flex flex-col md:items-end gap-6">
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-4xl font-black text-[#CCFF00]">0.00$</div>
                  <div className="text-[10px] uppercase opacity-50">Monthly Recurring Cost</div>
                </div>
                <div className="w-px h-12 bg-[#CCFF00]/30"></div>
                <div className="text-right">
                  <div className="text-4xl font-black text-[#CCFF00]">100/100</div>
                  <div className="text-[10px] uppercase opacity-50">Lighthouse Score</div>
                </div>
              </div>
              <button className="group relative bg-[#CCFF00] text-[#0A0F0B] px-12 py-6 font-black text-xl uppercase overflow-hidden transition-all hover:pr-16">
                <span>Start Deployment</span>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated Background Text */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 text-[20vw] font-black text-white/[0.02] pointer-events-none select-none uppercase">
          Static
        </div>
      </header>

      {/* The "Free" Logic Section */}
      <section id="thecost" className="py-32 px-6 bg-[#111812] border-y border-[#CCFF00]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start mb-20 gap-8">
            <h2 className="text-4xl md:text-6xl font-black uppercase max-w-md leading-none">
              Better than the <span className="text-[#CCFF00]">WP Guy</span>
            </h2>
            <div className="md:text-right font-bold text-[#CCFF00] flex flex-col items-end">
              <span className="text-xs tracking-[0.4em] mb-2">INFRASTRUCTURE COMPARISON</span>
              <p className="max-w-xs text-sm opacity-60">WordPress requires a server that sleeps. Our sites live on the edge, responding in 15ms globally.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-1">
            <ComparisonCard 
              title="Hosting Cost" 
              wp="30-100$/mo" 
              us="0$/mo Forever" 
              desc="Cloudflare Workers & Pages allow us to host your site globally without a central server." 
              icon={<Infinity className="text-[#CCFF00]" />}
            />
            <ComparisonCard 
              title="Security" 
              wp="High Vulnerability" 
              us="Military Grade" 
              desc="No SQL databases to inject. No admin panels to brute force. Hardened at the edge." 
              icon={<Shield className="text-[#CCFF00]" />}
            />
            <ComparisonCard 
              title="Global Speed" 
              wp="1.5s - 3s Load" 
              us="<200ms Load" 
              desc="Vite-powered React builds ship only the bytes your user needs. Instant interactivity." 
              icon={<Zap className="text-[#CCFF00]" />}
            />
          </div>
        </div>
      </section>

      {/* Bento Architecture Section */}
      <section id="stack" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[800px]">
            {/* Cloudflare Worker Card */}
            <div className="md:col-span-8 bg-[#1A221C] border-l-4 border-[#CCFF00] p-12 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -right-20 -top-20 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe size={400} />
              </div>
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-[#CCFF00] text-[#0A0F0B]">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-3xl font-black italic uppercase">Cloudflare Global</h3>
                </div>
                <p className="text-2xl text-[#E0E7E1]/60 leading-relaxed max-w-2xl font-sans">
                  We deploy your logic to <span className="text-[#CCFF00]">300+ data centers</span>. 
                  When a user visits, the code runs in the city closest to them. 
                  Speed is a physical constant we've mastered.
                </p>
              </div>
              <div className="mt-8 flex gap-4 overflow-hidden">
                <code className="text-[#CCFF00] bg-black/50 p-4 border border-[#CCFF00]/20 rounded text-sm w-full">
                  // Global distribution initialized <br />
                  $ deploy --target-edge
                </code>
              </div>
            </div>

            {/* Firebase Database Card */}
            <div className="md:col-span-4 bg-[#CCFF00] text-[#0A0F0B] p-12 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-500">
              <Database size={64} strokeWidth={3} />
              <div>
                <h3 className="text-3xl font-black uppercase mb-4">Firebase Engine</h3>
                <p className="font-bold opacity-80 font-sans">
                  Real-time data synchronization. Secure authentication. All without a single server-side setup.
                </p>
              </div>
            </div>

            {/* React Vite Card */}
            <div className="md:col-span-5 bg-[#1A221C] border border-[#CCFF00]/20 p-12 flex flex-col group">
              <div className="mb-auto">
                <Layers size={48} className="text-[#CCFF00] mb-8 group-hover:rotate-12 transition-transform" />
                <h3 className="text-3xl font-black uppercase mb-4">React + Vite</h3>
                <p className="text-[#E0E7E1]/60 font-sans">
                  The fastest build tool on the planet meets the most flexible UI framework. We ship zero-bloat, high-performance components.
                </p>
              </div>
              <div className="mt-12 flex items-center gap-2">
                <div className="w-3 h-3 bg-[#CCFF00] rounded-full"></div>
                <span className="text-xs font-bold tracking-widest opacity-60 uppercase">Hot Module Replacement Active</span>
              </div>
            </div>

            {/* Security Architecture Card */}
            <div className="md:col-span-7 bg-[#0A0F0B] border-4 border-[#1A221C] p-12 flex flex-col md:flex-row gap-8 items-center justify-between group hover:border-[#CCFF00] transition-colors">
              <div className="max-w-sm">
                <h3 className="text-3xl font-black uppercase mb-4 text-[#CCFF00]">Fortress Protocol</h3>
                <p className="text-[#E0E7E1]/60 font-sans">
                  By removing the server, we remove the target. Your site is immutable, version-controlled, and inherently secure.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-[#1A221C] border border-[#CCFF00]/10 flex flex-col items-center">
                  <Lock size={24} className="text-[#CCFF00] mb-2" />
                  <span className="text-[10px] font-bold">AUTH0/FB</span>
                </div>
                <div className="p-6 bg-[#1A221C] border border-[#CCFF00]/10 flex flex-col items-center">
                  <Cpu size={24} className="text-[#CCFF00] mb-2" />
                  <span className="text-[10px] font-bold">SSL+AES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / CTA */}
      <section className="py-48 px-6 text-center overflow-hidden relative">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl md:text-[7rem] font-black uppercase leading-none mb-12 tracking-tighter">
            Stop Renting. <br />
            <span className="text-[#CCFF00]">Start Owning.</span>
          </h2>
          <p className="text-xl md:text-2xl opacity-60 mb-16 font-sans">
            Every dollar spent on WordPress hosting is a dollar stolen from your marketing budget. 
            We build the last website you'll ever need.
          </p>
          <button className="bg-transparent text-[#CCFF00] border-4 border-[#CCFF00] px-16 py-8 text-2xl font-black uppercase hover:bg-[#CCFF00] hover:text-[#0A0F0B] transition-all duration-500">
            Kill My Hosting Bill
          </button>
        </div>
        
        {/* Abstract Geometry */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0,50 L100,50 M50,0 L50,100" stroke="#CCFF00" strokeWidth="0.1" />
            <circle cx="50" cy="50" r="30" stroke="#CCFF00" strokeWidth="0.1" fill="none" />
          </svg>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050805] py-20 px-6 border-t border-[#CCFF00]/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#CCFF00] flex items-center justify-center rotate-45">
                <div className="w-3 h-3 bg-[#0A0F0B] -rotate-45"></div>
              </div>
              <span className="text-xl font-black uppercase">EdgeArchitect</span>
            </div>
            <p className="text-sm opacity-50 max-w-sm font-sans mb-8">
              Silicon Forest Engineering. Built for speed, secured by the edge, hosted by the future. 
              © 2024. No Rights Reserved. Just Good Code.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Github', 'LinkedIn'].map(s => (
                <a key={s} href="#" className="text-xs font-bold hover:text-[#CCFF00] transition-colors underline">{s}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black mb-6 text-[#CCFF00]">SERVICES</h4>
            <ul className="text-sm space-y-4 opacity-70">
              <li>Edge Migration</li>
              <li>React Architecture</li>
              <li>Firebase Engineering</li>
              <li>Speed Optimization</li>
            </ul>
          </div>
          <div>
            <h4 className="font-black mb-6 text-[#CCFF00]">CONTACT</h4>
            <ul className="text-sm space-y-4 opacity-70">
              <li>terminal@edge.arch</li>
              <li>+1 (555) EDGE-DEV</li>
              <li>101 Null Street, Cyberspace</li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Custom Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        
        body {
          font-family: 'JetBrains Mono', monospace;
        }

        h1, h2, h3, h4, .font-sans {
          font-family: 'Unbounded', sans-serif;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-reveal {
          animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        html {
          scroll-behavior: smooth;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0A0F0B;
        }
        ::-webkit-scrollbar-thumb {
          background: #CCFF00;
        }
      `}} />
    </div>
  );
};

const ComparisonCard = ({ title, wp, us, desc, icon }) => (
  <div className="bg-[#1A221C]/40 border border-[#CCFF00]/10 p-10 group hover:bg-[#1A221C] transition-all duration-300">
    <div className="mb-8">{icon}</div>
    <h4 className="text-xs font-bold tracking-[0.4em] opacity-40 mb-6 uppercase">{title}</h4>
    
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex items-center gap-2 line-through opacity-30 text-sm">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        WP: {wp}
      </div>
      <div className="flex items-center gap-2 text-xl font-black text-[#CCFF00] uppercase italic">
        <span className="w-2 h-2 bg-[#CCFF00] rounded-full animate-pulse"></span>
        {us}
      </div>
    </div>
    
    <p className="text-sm leading-relaxed opacity-60 font-sans">
      {desc}
    </p>
  </div>
);

export default App;