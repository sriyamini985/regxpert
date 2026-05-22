import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

const Conferences = () => {

  const navigate = useNavigate();

  const [title, setTitle] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [conferences, setConferences] =
    useState<any[]>([]);

  /* LOAD */
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

  /* CREATE */
  const createConference =
    async () => {

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
            .replace(/\s+/g, "") +
          year;

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/conferences`,
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

        const data =
          await res.json();

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
    <div className="min-h-screen bg-[#f4f7fb]">

      <div className="max-w-7xl mx-auto px-8 pt-24 pb-20">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-6xl font-black text-gray-900">
            Conferences
          </h1>

          <p className="text-gray-500 text-xl mt-3">
            Create and manage all conferences
          </p>

        </div>

        {/* CREATE BOX */}
        <div className="bg-white rounded-[35px] shadow-xl border border-gray-100 p-10 mb-12">

          <div className="flex flex-col lg:flex-row gap-5 items-center">

            <div className="flex-1 w-full">

              <h2 className="text-4xl font-bold mb-3">
                Create Conference
              </h2>

              <p className="text-gray-500 mb-6 text-lg">
                Create separate conference workspace
              </p>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Enter Conference Name"
                className="w-full h-16 rounded-2xl border border-gray-200 px-6 text-xl outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <button
              onClick={
                createConference
              }
              disabled={loading}
              className="h-16 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl shadow-lg transition-all"
            >
              {loading
                ? "Creating..."
                : "Create"}
            </button>

          </div>

        </div>

        {/* CONFERENCE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {conferences.map(
            (conference) => (

              <div
                key={conference._id}
                className="bg-white rounded-[35px] p-8 shadow-xl border border-gray-100 hover:scale-[1.02] transition-all"
              >

                {/* TOP */}
                <div className="flex items-start justify-between mb-6">

                  <div>

                    <h2 className="text-4xl font-black text-gray-900">

                      {conference.title}

                    </h2>

                    <p className="text-gray-500 mt-2 text-lg">
                      {conference.slug}
                    </p>

                  </div>

                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-5 mb-8">

                  <div className="bg-gray-100 rounded-2xl p-4 text-center">

                    <p className="text-gray-500 text-sm">
                      Created
                    </p>

                    <h3 className="text-lg font-bold mt-2">
                      {new Date().toLocaleDateString()}
                    </h3>

                  </div>

                </div>

                {/* BUTTON */}
                <button
                  onClick={() =>
                    navigate(
                      `/conference/${conference.slug}`
                    )
                  }
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg transition-all"
                >
                  Open Dashboard →
                </button>

              </div>
            )
          )}

        </div>

      </div>

    </div>
  );
};

export default Conferences;