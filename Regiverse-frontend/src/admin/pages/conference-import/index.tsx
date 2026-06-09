import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Conferences = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [conferences, setConferences] = useState<any[]>([]);

  const loadConferences = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences`);
      const data = await res.json();
      setConferences(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setConferences([]);
    }
  };

  useEffect(() => {
    loadConferences();
  }, []);

  const createConference = async () => {
    if (!title.trim()) return alert("Enter conference name");
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        loadConferences();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black mb-10">Conferences</h1>
        
        <div className="bg-white p-10 rounded-[35px] shadow-sm mb-12">
          <input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter Conference Name"
            className="w-full h-16 border px-6 rounded-2xl mb-4"
          />
          <button onClick={createConference} className="bg-blue-600 text-white px-10 py-4 rounded-2xl">
            {loading ? "Creating..." : "Create Conference"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {conferences.map((c) => (
            <div key={c._id} className="bg-white p-8 rounded-[35px] shadow-sm">
              <h2 className="text-3xl font-bold mb-2">{c.name}</h2>
              <button 
                // Navigate using the slug if it exists, otherwise the ID
                onClick={() => navigate(`/conference/${c.slug || c._id}`)}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl mt-4"
              >
                Open Dashboard →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default Conferences;

