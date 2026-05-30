import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import LoginForm from './components/LoginForm';

const LoginIllustration = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#0F1014]">
    <img
      src="/assets/images/login_character_3d.png"
      alt="Login"
      className="w-full h-full object-contain"
    />
  </div>
);

const Login = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Sign In - RegiVerse</title>
      </Helmet>

      <div className="h-screen flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden"
        >

          {/* LEFT */}
          <div className="w-full md:w-1/2 p-10">
            <h1 className="text-2xl font-bold mb-4">
              Welcome to RegiVerse
            </h1>

            <LoginForm />

            <p className="mt-6 text-sm text-gray-500">
              Don't have an account?
              <button
                onClick={() => navigate('/food-scan')}
                className="ml-2 text-blue-600"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* RIGHT */}
          <div className="w-full md:w-1/2">
            <LoginIllustration />
          </div>

        </motion.div>
      </div>
    </>
  );
};

export default Login;