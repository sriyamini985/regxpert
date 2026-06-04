import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from 'components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);

    // ✅ SIMPLE LOGIN (TEMP BACKEND REPLACEMENT)
    setTimeout(() => {
      if (
        formData.email === 'admin@gmail.com' &&
        formData.password === '123456'
      ) {
        localStorage.setItem("auth", "true"); // ✅ store login
        navigate('/admin-dashboard');
      } else {
        setErrors({ general: 'Invalid email or password' });
      }

      setIsLoading(false);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
          <Icon name="AlertCircle" size={16} className="text-red-500" />
          <p className="text-xs text-red-500">{errors.general}</p>
        </div>
      )}

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
        className="w-full px-4 py-3 border rounded-xl"
      />

      {/* PASSWORD */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-3 border rounded-xl"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3"
        >
          <Icon name={showPassword ? 'EyeOff' : 'Unlock'} size={18} />
        </button>
      </div>

      {/* SUBMIT */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </motion.button>

    </form>
  );
};

export default LoginForm;

