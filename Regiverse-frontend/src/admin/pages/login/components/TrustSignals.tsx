import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';
import type { TrustSignal } from '../types';

interface TrustSignalsProps {
  signals: TrustSignal[];
}

const TrustSignals = ({ signals }: TrustSignalsProps) => {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-4 mt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {signals.map((signal, index) => (
        <motion.div
          key={signal.id}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 + index * 0.1 }}
          whileHover={{
            scale: 1.05,
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(6, 182, 212, 0.3)'
          }}
        >
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
            <Icon name={signal.icon} size={12} className="text-cyan-400" />
          </div>
          <span className="text-xs font-medium text-slate-300">
            {signal.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TrustSignals;