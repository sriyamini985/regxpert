import { motion } from 'framer-motion';

const LoginHeader = () => {
  return (
    <motion.div
      className="text-center mb-8"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Unified Logo */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4">
          <span className="text-white font-bold text-6xl">R</span>
        </div>
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 tracking-tight">RegXpert</h1>
      </div>

      <motion.p
        className="text-slate-400 text-base"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Access your event dashboard
      </motion.p>
    </motion.div>
  );
};

export default LoginHeader;