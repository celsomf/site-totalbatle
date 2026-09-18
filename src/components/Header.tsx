import React from 'react';
import { Swords, Shield, Award, Database } from 'lucide-react';

interface HeaderProps {
  dbStatus?: 'connected' | 'offline' | 'checking';
}

export const Header: React.FC<HeaderProps> = ({ dbStatus = 'checking' }) => {
  return (
    <header className="border-b-2 border-[#caa568]/80 bg-gradient-to-r from-[#1c120c] via-[#2a1b12] to-[#1c120c] shadow-2xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Game Title Plaque */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#caa568] via-[#a37c3f] to-[#6d4c1f] flex items-center justify-center shadow-lg border-2 border-[#fef08a] ring-1 ring-black">
            <Swords className="w-6 h-6 text-[#1a0f08] drop-shadow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-[#fef08a] font-fantasy tracking-wider drop-shadow-md">
                TOTAL BATTLE <span className="text-[#caa568] font-bold text-xs sm:text-sm tracking-normal">CONSELHEIRO DE GUERRA</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] text-[#e8f5e9] border border-[#81c784] shadow-sm hidden sm:inline-block">
                ★ Conta Araning
              </span>
            </div>
            <p className="text-[11px] text-[#caa568]/90 font-serif">
              Stacking 2n+1 de Buchas • Caça a Monstros & Épicos • Criptas 1-Hit KO
            </p>
          </div>
        </div>

        {/* Game Stats & Database Status Badges */}
        <div className="flex items-center gap-2 text-xs font-serif flex-wrap">
          {/* PostgreSQL Badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[11px] shadow-inner ${
              dbStatus === 'connected'
                ? 'bg-[#0f2413] border-[#2e7d32] text-[#a5d6a7]'
                : dbStatus === 'checking'
                ? 'bg-[#291f0c] border-[#b45309] text-[#fde68a]'
                : 'bg-[#241414] border-[#7f1d1d] text-[#fca5a5]'
            }`}
            title={
              dbStatus === 'connected'
                ? 'Conectado e persistindo no PostgreSQL 17'
                : 'Servidor PostgreSQL offline (salvando localmente)'
            }
          >
            <Database className="w-3.5 h-3.5" />
            <span className="font-bold">
              {dbStatus === 'connected'
                ? 'PostgreSQL 17 ● Conectado'
                : dbStatus === 'checking'
                ? 'Conectando ao Banco...'
                : 'LocalStorage (Offline)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#160d08] border border-[#8b6d3b] text-[#fef08a] shadow-inner">
            <Shield className="w-3.5 h-3.5 text-[#caa568]" />
            <span className="font-bold">Capitólio Nv 16</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#160d08] border border-[#8b6d3b] text-[#fef08a] shadow-inner">
            <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="font-bold">Herói Nv 16</span>
          </div>
        </div>
      </div>
    </header>
  );
};
