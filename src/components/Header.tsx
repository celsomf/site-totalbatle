import React from 'react';
import { Swords, Shield, Award, Database, Sparkles } from 'lucide-react';

interface HeaderProps {
  dbStatus?: 'connected' | 'offline' | 'checking';
}

export const Header: React.FC<HeaderProps> = ({ dbStatus = 'checking' }) => {
  return (
    <header className="border-b border-slate-800/80 bg-[#0d1322]/90 backdrop-blur-md shadow-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Game Title Plaque */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300 ring-2 ring-black/40 flex-shrink-0">
            <Swords className="w-6 h-6 text-slate-950 drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-black text-white tracking-wide">
                TOTAL BATTLE <span className="text-amber-400 font-extrabold text-xs sm:text-sm">COMMAND HUB</span>
              </h1>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-sm hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Painel do Jogador
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Otimização de Marcha 2n+1 • Caça a Monstros & Épicos • Criptas 1-Hit KO
            </p>
          </div>
        </div>

        {/* Game Stats & Database Status Badges */}
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          {/* PostgreSQL Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs shadow-inner font-bold ${
              dbStatus === 'connected'
                ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300 shadow-emerald-950/50'
                : dbStatus === 'checking'
                ? 'bg-amber-950/80 border-amber-600/60 text-amber-300 shadow-amber-950/50'
                : 'bg-rose-950/80 border-rose-600/60 text-rose-300 shadow-rose-950/50'
            }`}
            title={
              dbStatus === 'connected'
                ? 'Conectado e sincronizado com o PostgreSQL 17'
                : 'Salvando localmente no navegador'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span>
              {dbStatus === 'connected'
                ? 'PostgreSQL 17 ● Online'
                : dbStatus === 'checking'
                ? 'Conectando...'
                : 'LocalStorage (Offline)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 shadow-inner font-bold">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Reino K:310</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 shadow-inner font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Capitólio Nv 16</span>
          </div>
        </div>
      </div>
    </header>
  );
};
