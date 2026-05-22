import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

const cards = [
  {
    title: "Dashboard",
    route: "dashboard",
  },

  {
    title: "Upload Excel",
    route: "upload",
  },

  {
    title: "Add Delegate",
    route: "add-delegate",
  },

  {
    title: "Registered List",
    route: "registered-list",
  },

  {
    title: "Bulk Email",
    route: "bulk-email",
  },

  {
    title: "Bulk WhatsApp",
    route: "bulk-whatsapp",
  },

  {
    title: "Food Scan",
    route: "food-scan",
  },

  {
    title: "Kitbag Scan",
    route: "kitbag-scan",
  },

  {
    title: "Certificate Scan",
    route: "certificate-scan",
  },

  {
    title: "Workshop Scan",
    route: "workshop-scan",
  },

  {
    title: "Hall Scan",
    route: "hall-entry-exit-scan",
  },

  {
    title: "Mono Scan",
    route: "mono-scan",
  },
];

const ConferenceDashboard = () => {

  const navigate = useNavigate();

  const { conferenceId } =
    useParams();

  const [participants, setParticipants] =
    useState<any[]>([]);

  /* LOAD DELEGATES */

  useEffect(() => {

    if (!conferenceId) return;

    fetch(
      `http://localhost:5000/api/participants/conference/${conferenceId}`
    )
      .then((res) => res.json())
      .then((data) => {

        console.log(data);

        if (Array.isArray(data)) {
          setParticipants(data);
        } else {
          setParticipants([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });

  }, [conferenceId]);

  /* NAVIGATION */

  const handleNavigation = (
    route: string
  ) => {

    /* DASHBOARD */

    if (route === "dashboard") {

      navigate(
        `/admin-dashboard?conferenceId=${conferenceId}`
      );

      return;
    }

    /* UPLOAD */

    if (route === "upload") {

      navigate(
        `/upload?conferenceId=${conferenceId}`
      );

      return;
    }

    /* REGISTERED LIST */

    if (
      route ===
      "registered-list"
    ) {

      navigate(
        `/conference/${conferenceId}/registered-list`
      );

      return;
    }

    /* BULK EMAIL */

    if (
      route === "bulk-email"
    ) {

      navigate(
        `/conference/${conferenceId}/bulk-email`
      );

      return;
    }

    /* BULK WHATSAPP */

    if (
      route ===
      "bulk-whatsapp"
    ) {

      navigate(
        `/conference/${conferenceId}/bulk-whatsapp`
      );

      return;
    }

    /* ADD DELEGATE */

    if (
      route ===
      "add-delegate"
    ) {

      navigate(
        `/add-delegate?conferenceId=${conferenceId}`
      );

      return;
    }

    /* OTHER PAGES */

    navigate(`/${route}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="mb-10">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm text-gray-500 mb-2">
                Active Conference
              </p>

              <h1 className="text-5xl font-bold text-gray-900 capitalize">
                {conferenceId}
              </h1>

              <p className="text-gray-500 mt-3">
                Conference Management Dashboard
              </p>

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          <div className="bg-white rounded-3xl p-8 shadow-sm border">

            <p className="text-gray-500 text-sm">
              Total Delegates
            </p>

            <h2 className="text-5xl font-bold mt-4 text-blue-600">

              {participants.length}

            </h2>

          </div>

        </div>

        {/* ACTIONS */}

        <div>

          <h2 className="text-2xl font-bold mb-6">

            Quick Actions

          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {cards.map((card) => (

              <button
                key={card.title}

                onClick={() =>
                  handleNavigation(
                    card.route
                  )
                }

                className="bg-white rounded-3xl border shadow-sm p-8 text-left hover:shadow-xl hover:-translate-y-1 transition-all"
              >

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">

                  <span className="text-blue-600 text-2xl">
                    ✦
                  </span>

                </div>

                <h3 className="text-xl font-bold text-gray-900">

                  {card.title}

                </h3>

                <p className="text-gray-500 mt-2">

                  Open {card.title}

                </p>

              </button>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default ConferenceDashboard;