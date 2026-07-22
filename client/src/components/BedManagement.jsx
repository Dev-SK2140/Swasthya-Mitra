import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const BedManagement = () => {
  // Generate some mock beds
  const [beds, setBeds] = useState(
    Array.from({ length: 24 }).map((_, i) => ({
      id: `B-${i + 101}`,
      status: i < 5 ? 'critical' : i < 15 ? 'occupied' : i === 18 ? 'maintenance' : 'available',
      patient: i < 15 ? `Patient ${i + 1}` : null,
      ward: i < 8 ? 'ICU' : 'General'
    }))
  );

  const [filter, setFilter] = useState('all');

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-[var(--color-secondary)]/20 border-[var(--color-secondary)]/50 text-[var(--color-secondary)]';
      case 'occupied': return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'critical': return 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse';
      case 'maintenance': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      default: return 'bg-slate-800 border-slate-700';
    }
  };

  const filteredBeds = filter === 'all' ? beds : beds.filter(b => b.status === filter);

  return (
    <div className="glass-panel p-6 bg-slate-800/40 border border-slate-700/50 rounded-xl mt-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
        <div>
          <h3 className="text-xl font-medium text-white flex items-center gap-2">
            <BedDouble className="text-[var(--color-primary)]" /> Real-Time Bed Allocation
          </h3>
          <p className="text-sm text-slate-400 mt-1">Drag and drop patients or update bed status directly.</p>
        </div>
        
        <div className="flex gap-2">
          {['all', 'available', 'occupied', 'critical', 'maintenance'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filter === f ? 'bg-[var(--color-primary)] text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <AnimatePresence>
          {filteredBeds.map(bed => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              key={bed.id}
              whileHover={{ y: -5 }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer transition-shadow hover:shadow-lg ${getStatusColor(bed.status)}`}
            >
              <BedDouble className="w-8 h-8 mb-2 opacity-80" />
              <div className="font-mono font-bold text-sm">{bed.id}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-70 mt-1">{bed.ward}</div>
              {bed.patient && (
                <div className="mt-2 text-xs bg-black/20 px-2 py-1 rounded w-full truncate">
                  {bed.patient}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      
      <div className="mt-6 flex justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--color-secondary)]/50"></span> Available ({beds.filter(b=>b.status==='available').length})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500/50"></span> Occupied ({beds.filter(b=>b.status==='occupied').length})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500/50"></span> Critical ({beds.filter(b=>b.status==='critical').length})</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500/50"></span> Maintenance ({beds.filter(b=>b.status==='maintenance').length})</div>
      </div>
    </div>
  );
};

export default BedManagement;
