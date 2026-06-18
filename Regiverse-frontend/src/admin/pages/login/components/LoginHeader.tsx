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
        <img
          src="/assets/images/regiverse-logo-new.png"
          alt="RegXperts Logo"
          className="w-24 h-24 object-contain mb-4"
        />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-200 tracking-tight">RegXperts</h1>
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