import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Conference {
  _id: string;
  title: string;
  slug: string;
}

const CreateConference = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [conferences, setConferences] =
    useState<Conference[]>([]);

  /* =========================
     LOAD CONFERENCES
  ========================= */
  const loadConferences = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/conferences`
      );

      const data = await res.json();

      setConferences(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadConferences();
  }, []);

  /* =========================
     CREATE CONFERENCE
  ========================= */
  const createConference = async () => {
    if (!title.trim()) {
      alert("Enter conference name");
      return;
    }

    try {
      setLoading(true);

      const year =
        new Date().getFullYear();

      const slug =
        title
          .toLowerCase()
          .replace(/\s+/g, "") + year;

      const res = await fetch(
        "http://localhost:5000/api/conferences",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title,
            slug,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {

        setTitle("");

        loadConferences();

        navigate(
          `/conference/${slug}`
        );
      }

    } catch (err) {
      console.log(err);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="pt-24 px-4 max-w-6xl mx-auto">

        {/* CREATE CARD */}
        <div className="bg-white rounded-3xl shadow-xl p-10 mb-10">

          <h1 className="text-4xl font-bold mb-3">
            Conferences
          </h1>

          <p className="text-gray-500 mb-8">
            Create or open conference
          </p>

          <div className="flex gap-4">

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Enter Conference Name"
              className="flex-1 border rounded-2xl p-5 text-lg"
            />

            <button
              onClick={createConference}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-2xl font-semibold"
            >
              {loading
                ? "Creating..."
                : "Create"}
            </button>

          </div>

        </div>

        {/* CONFERENCE LIST */}
        <div>

          <h2 className="text-3xl font-bold mb-6">
            Existing Conferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {conferences.map((conference) => (
              <div
                key={conference._id}
                className="bg-white rounded-3xl shadow-lg p-8 border"
              >
                <h3 className="text-2xl font-bold text-blue-600">
                  {conference.slug}
                </h3>

                <p className="text-gray-500 mt-2">
                  {conference.title}
                </p>

                <button
                  onClick={() =>
                    navigate(
                      `/conference/${conference.slug}`
                    )
                  }
                  className="mt-6 w-full bg-black text-white py-3 rounded-2xl"
                >
                  Open Dashboard
                </button>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
};

export default CreateConference;