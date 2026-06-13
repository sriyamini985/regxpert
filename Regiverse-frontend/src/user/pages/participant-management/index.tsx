import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

/* =========================
   TYPES
========================= */
type Participant = {
  _id?: string;
  id?: string;

  name: string;
  phone: string;
  email: string;
  state: string;
  category: string;
  reference: string;
  medicalCouncilNumber: string;
  printed: boolean;

  blockKitbag: boolean;
  blockCertificate: boolean;

  blockDay1Breakfast: boolean;
  blockDay1Lunch: boolean;
  blockDay1Dinner: boolean;

  blockDay2Breakfast: boolean;
  blockDay2Lunch: boolean;
  blockDay2Dinner: boolean;

  blockDay3Breakfast: boolean;
  blockDay3Lunch: boolean;
  blockDay3Dinner: boolean;

  blockDay4Breakfast: boolean;
  blockDay4Lunch: boolean;
  blockDay4Dinner: boolean;

  blockDay5Breakfast: boolean;
  blockDay5Lunch: boolean;
  blockDay5Dinner: boolean;

  blockWorkshop1: boolean;
  blockWorkshop2: boolean;
  blockWorkshop3: boolean;
  blockWorkshop4: boolean;
  blockWorkshop5: boolean;
};

type LocationState = {
  person?: Participant;
};

const defaultCategories = [
  "Delegates",
  "PG Delegates",
  "Accompanying Person",
  "Chairman",
  "Vice President",
];

const ParticipantPage = () => {
  const location = useLocation();
  const { id, conferenceSlug } = useParams();
  const state = location.state as LocationState;
  const editingPerson = state?.person;

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConference, setSelectedConference] = useState<string>("");

  const [form, setForm] = useState<Participant>({
    id: "",
    name: "",
    phone: "",
    email: "",
    state: "",
    category: "",
    reference: "",
    medicalCouncilNumber: "",
    printed: false,

    blockKitbag: false,
    blockCertificate: false,

    blockDay1Breakfast: false,
    blockDay1Lunch: false,
    blockDay1Dinner: false,

    blockDay2Breakfast: false,
    blockDay2Lunch: false,
    blockDay2Dinner: false,

    blockDay3Breakfast: false,
    blockDay3Lunch: false,
    blockDay3Dinner: false,

    blockDay4Breakfast: false,
    blockDay4Lunch: false,
    blockDay4Dinner: false,

    blockDay5Breakfast: false,
    blockDay5Lunch: false,
    blockDay5Dinner: false,

    blockWorkshop1: false,
    blockWorkshop2: false,
    blockWorkshop3: false,
    blockWorkshop4: false,
    blockWorkshop5: false,
  });

  /* =========================
      LOAD EDIT DATA & CONFERENCES
  ========================= */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/conferences`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setConferences(list);
        
        if (!editingPerson && conferenceSlug) {
          const match = list.find((c: any) => c.slug === conferenceSlug || c._id === conferenceSlug || c.name === conferenceSlug);
          if (match) {
            setSelectedConference(match._id);
          }
        }
      })
      .catch(err => console.error("Failed to load conferences", err));
  }, [conferenceSlug, editingPerson]);

  useEffect(() => {
    if (editingPerson) {
      setForm(editingPerson);
      if (editingPerson.conferenceId) {
        setSelectedConference(editingPerson.conferenceId);
      }
    }
  }, [editingPerson]);

  /* =========================
      HANDLE INPUT
  ========================= */
  const handleChange = (key: keyof Participant, value: any) => {
    setForm({
      ...form,
      [key]: value,
    });
  };

  /* =========================
      VALIDATION
  ========================= */
  const validateForm = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.email ||
      !form.state ||
      !form.category
    ) {
      alert("❌ Please fill all mandatory fields");
      return false;
    }
    return true;
  };

  /* =========================
      SUBMIT
  ========================= */
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!selectedConference) return alert("❌ Please select a conference / event.");

    try {
      const payload = { ...form, conferenceId: selectedConference };

      const url = editingPerson
        ? `${import.meta.env.VITE_API_URL}/api/participants/${form._id || form.id}`
        : `${import.meta.env.VITE_API_URL}/api/participants`;

      const res = await fetch(url, {
        method: editingPerson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result: any = {};

      try {
        result = JSON.parse(text);
      } catch (err) {
        if (text.startsWith("<!DOCTYPE")) {
          throw new Error("Backend API route not found. Check backend URL.");
        }
        throw new Error(text);
      }

      if (!res.ok) {
        throw new Error(result.message || "Failed");
      }

      alert(editingPerson ? "✅ Delegate Updated" : "✅ Delegate Registered");

      // Reset the form fields back to clean defaults if it was a brand new registration
      if (!editingPerson) {
        setForm({
          id: "",
          name: "",
          phone: "",
          email: "",
          state: "",
          category: "",
          reference: "",
          medicalCouncilNumber: "",
          printed: false,

          blockKitbag: false,
          blockCertificate: false,

          blockDay1Breakfast: false,
          blockDay1Lunch: false,
          blockDay1Dinner: false,

          blockDay2Breakfast: false,
          blockDay2Lunch: false,
          blockDay2Dinner: false,

          blockDay3Breakfast: false,
          blockDay3Lunch: false,
          blockDay3Dinner: false,

          blockDay4Breakfast: false,
          blockDay4Lunch: false,
          blockDay4Dinner: false,

          blockDay5Breakfast: false,
          blockDay5Lunch: false,
          blockDay5Dinner: false,

          blockWorkshop1: false,
          blockWorkshop2: false,
          blockWorkshop3: false,
          blockWorkshop4: false,
          blockWorkshop5: false,
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start pt-20 pb-20 px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-8">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {editingPerson ? "Edit Delegate" : "Add New Delegate"}
            </h2>
            <p className="text-sm text-gray-500">Conference Registration</p>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl bg-white font-medium text-gray-700"
              disabled={!!editingPerson}
            >
              <option value="">Select Conference / Event *</option>
              {conferences.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <input
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Mobile Number *"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Email Address *"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="State / City *"
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Medical Council Number *"
            value={form.medicalCouncilNumber}
            onChange={(e) => handleChange("medicalCouncilNumber", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl md:col-span-2"
          />

          <div className="md:col-span-2">
            <select
              value={form.category}
              onChange={(e) => {
                if (e.target.value === "__add_new__") {
                  const category = prompt("Enter New Category");
                  if (category && !categories.includes(category)) {
                    setCategories([...categories, category]);
                    handleChange("category", category);
                  }
                  return;
                }
                handleChange("category", e.target.value);
              }}
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="">Select Category *</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__add_new__">+ Add New Category</option>
            </select>
          </div>

          <input
            placeholder="Reference *"
            value={form.reference}
            onChange={(e) => handleChange("reference", e.target.value)}
            className="w-full px-4 py-3 border rounded-xl md:col-span-2"
          />

          {/* RESTRICTIONS */}
          <div className="mt-10 bg-red-50 border border-red-200 rounded-3xl p-8 md:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-red-900">
                Restrictions & Blocked Access
              </h2>
              <p className="text-sm text-red-700 mt-1">
                Checked means NOT ALLOWED
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <label className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm">
                <input
                  type="checkbox"
                  checked={form.blockKitbag}
                  onChange={(e) => handleChange("blockKitbag", e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Block Kitbag</p>
                  <p className="text-sm text-gray-500">Participant cannot collect kitbag</p>
                </div>
              </label>

              <label className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm">
                <input
                  type="checkbox"
                  checked={form.blockCertificate}
                  onChange={(e) => handleChange("blockCertificate", e.target.checked)}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold text-gray-800">Block Certificate</p>
                  <p className="text-sm text-gray-500">Certificate access denied</p>
                </div>
              </label>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-red-900 mb-6">Food Restrictions</h3>
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div key={day} className="bg-white border rounded-2xl p-5 shadow-sm">
                    <h4 className="font-semibold text-gray-800 mb-4">Day {day}</h4>
                    <div className="flex flex-wrap gap-6">
                      {["Breakfast", "Lunch", "Dinner"].map((meal) => {
                        const key = `blockDay${day}${meal}` as keyof Participant;
                        return (
                          <label key={meal} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form[key] as boolean}
                              onChange={(e) => handleChange(key, e.target.checked)}
                              className="w-5 h-5"
                            />
                            <span className="text-gray-700">Block {meal}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-bold text-red-900 mb-6">Workshop Restrictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5].map((num) => {
                  const key = `blockWorkshop${num}` as keyof Participant;
                  return (
                    <label key={num} className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm">
                      <input
                        type="checkbox"
                        checked={form[key] as boolean}
                        onChange={(e) => handleChange(key, e.target.checked)}
                        className="w-5 h-5"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">Block Workshop {num}</p>
                        <p className="text-sm text-gray-500">Deny workshop access</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* SUBMIT */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-medium"
          >
            {editingPerson ? "Update Delegate" : "Complete Registration"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPage;