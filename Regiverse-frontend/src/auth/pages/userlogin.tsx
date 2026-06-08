import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function UserLogin() {
  const { login, quickUserLogin } = useAuth(); // Extracted quickUserLogin from context
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async () => {
    const res = await login(email, password, "user");
    if (res.success) {
      // Directs the standard user login securely into the dynamic conference slug container
      navigate("/u/demo-event");
    } else {
      alert(res.error);
    }
  };

  // Instantly bypass checks on direct click
  const handleQuickClick = () => {
    quickUserLogin();
    navigate("/u/demo-event"); // Matches your new /u/:conferenceSlug routing setup
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-[400px]">
        <h2 className="text-2xl font-bold mb-6">User Login</h2>
        <input
          className="border p-2 w-full mb-3 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
              <input 
        type="password" 
        className="border p-2 w-full mb-4 rounded" 
        placeholder="Password" 
        value={password} // Bind to state
        onChange={(e) => setPassword(e.target.value)} // Update state on change
      />
        <button
          onClick={submit}
          className="bg-black text-white px-4 py-2 w-full mb-3 rounded hover:bg-zinc-800 transition-colors"
        >
          Login
        </button>

        {/* Dynamic Shortcut Bypass Divider and Button */}
        <div className="relative my-4 flex items-center justify-center">
          <hr className="w-full border-gray-200" />
          <span className="absolute bg-white px-2 text-xs text-gray-400 font-medium">OR</span>
        </div>

        <button
          onClick={handleQuickClick}
          className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700 transition-colors font-semibold shadow-sm"
        >
          Direct Click Login (Bypass)
        </button>
      </div>
    </div>
  );
}