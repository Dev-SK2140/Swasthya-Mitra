import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const FeatureModal = ({ isOpen, onClose, title, icon: Icon, children, color }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4 bg-gradient-to-r ${color} to-transparent bg-opacity-10 dark:bg-opacity-20`}>
            <div className={`p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-slate-700 dark:text-white`}>
              {Icon && <Icon className="w-6 h-6" />}
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="ml-auto p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const FeatureCard = ({ feature, onClick }) => {
  const { title, description, icon: Icon, colorClass } = feature;
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(feature)}
      className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm hover:shadow-lg transition-all group overflow-hidden relative"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 dark:opacity-20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500`} />
      
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${colorClass} text-white shadow-md`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{description}</p>
      </div>
    </motion.button>
  );
};

export const FeatureHub = ({ title = "Dashboard Capabilities", features = [] }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <div className="w-2 h-6 bg-[var(--color-primary)] rounded-full" />
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {features.map((feature, idx) => (
          <FeatureCard 
            key={idx} 
            feature={feature} 
            onClick={(f) => setSelectedFeature(f)} 
          />
        ))}
      </div>

      {selectedFeature && (
        <FeatureModal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          title={selectedFeature.title}
          icon={selectedFeature.icon}
          color={selectedFeature.colorClass}
        >
          {selectedFeature.component || (
            <GenericMockFeature title={selectedFeature.title} description={selectedFeature.description} />
          )}
        </FeatureModal>
      )}
    </div>
  );
};

// A generic mock feature content if no specific component is provided
export const GenericMockFeature = ({ title, description }) => {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-center py-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </motion.div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Action Completed</h3>
        <p className="text-slate-500 dark:text-slate-400">The operation for "{title}" was successfully executed.</p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-6 text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          Perform another action
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <p className="text-slate-700 dark:text-slate-300">{description}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Patient / Target</label>
          <select className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)]">
            <option>Ramesh Patel (ID: PT-10293)</option>
            <option>Bhavna Desai (ID: PT-10294)</option>
            <option>General Operation</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes</label>
          <textarea 
            rows="3" 
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 outline-none focus:border-[var(--color-primary)] resize-none"
            placeholder="Enter any necessary remarks or data here..."
          ></textarea>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button 
            onClick={() => setSubmitted(true)}
            className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Execute {title}
          </button>
        </div>
      </div>
    </div>
  );
};
