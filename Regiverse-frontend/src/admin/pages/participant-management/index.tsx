import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";


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
  blockDay1Breakfast: boolean; blockDay1Lunch: boolean; blockDay1Dinner: boolean;
  blockDay2Breakfast: boolean; blockDay2Lunch: boolean; blockDay2Dinner: boolean;
  blockDay3Breakfast: boolean; blockDay3Lunch: boolean; blockDay3Dinner: boolean;
  blockDay4Breakfast: boolean; blockDay4Lunch: boolean; blockDay4Dinner: boolean;
  blockDay5Breakfast: boolean; blockDay5Lunch: boolean; blockDay5Dinner: boolean;
  blockWorkshop1: boolean; blockWorkshop2: boolean; blockWorkshop3: boolean;
  blockWorkshop4: boolean; blockWorkshop5: boolean;
  dynamicData?: Record<string, any>;
};

const defaultCategories = ["Delegates", "PG Delegates", "Accompanying Person", "Chairman", "Vice President"];

const ParticipantPage = () => {
  const navigate = useNavigate();
  const { conferenceId } = useParams();
  const { state } = useLocation() as { state: { person?: Participant } };
  const editingPerson = state?.person;

  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [conferences, setConferences] = useState<any[]>([]);
  const [selectedConference, setSelectedConference] = useState<string>("");

  const [form, setForm] = useState<Participant>({
    name: "", phone: "", email: "", state: "", category: "", reference: "", medicalCouncilNumber: "", printed: false,
    blockKitbag: false, blockCertificate: false,
    blockDay1Breakfast: false, blockDay1Lunch: false, blockDay1Dinner: false,
    blockDay2Breakfast: false, blockDay2Lunch: false, blockDay2Dinner: false,
    blockDay3Breakfast: false, blockDay3Lunch: false, blockDay3Dinner: false,
    blockDay4Breakfast: false, blockDay4Lunch: false, blockDay4Dinner: false,
    blockDay5Breakfast: false, blockDay5Lunch: false, blockDay5Dinner: false,
    blockWorkshop1: false, blockWorkshop2: false, blockWorkshop3: false, blockWorkshop4: false, blockWorkshop5: false,
    dynamicData: {}
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/conferences`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setConferences(list);
        if (!editingPerson && conferenceId) {
          const match = list.find((c: any) => c._id === conferenceId || c.slug === conferenceId || c.name === conferenceId);
          if (match) {
            setSelectedConference(match._id);
          }
        }
      })
      .catch(err => console.error(err));
  }, [conferenceId, editingPerson]);

  useEffect(() => {
    if (editingPerson) {
      setForm(editingPerson);
      if (editingPerson.conferenceId) {
        setSelectedConference(editingPerson.conferenceId);
      }
    }
  }, [editingPerson]);

  const handleChange = (key: keyof Participant, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleCategoryChange = (val: string) => {
    if (val === "ADD_NEW") {
      const newCat = prompt("Enter new category:");
      if (newCat && !categories.includes(newCat)) {
        setCategories([...categories, newCat]);
        handleChange("category", newCat);
      }
    } else handleChange("category", val);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("❌ Image size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(prev => ({
        ...prev,
        dynamicData: {
          ...(prev.dynamicData || {}),
          Photo: base64
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(prev => ({
      ...prev,
      dynamicData: {
        ...(prev.dynamicData || {}),
        Photo: ""
      }
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.category) return alert("❌ Mandatory fields missing.");
    if (!selectedConference) return alert("❌ Please select a conference / event.");
    try {
      const url = editingPerson ? `${import.meta.env.VITE_API_URL}/api/participants/${form._id || form.id}` : `${import.meta.env.VITE_API_URL}/api/participants`;
      
      const payload = { ...form, conferenceId: selectedConference };
      const res = await fetch(url, {
        method: editingPerson ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let result: any = {};
      try {
        result = JSON.parse(text);
      } catch (e) {}

      if (!res.ok) throw new Error(result.message || "Error saving data");
      alert("✅ Success");
      navigate(`/admin/conference/${selectedConference}`);
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold mb-6">{editingPerson ? "Edit Delegate" : "Registration Terminal"}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-3">
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="w-full p-3 border rounded-xl bg-white font-medium text-gray-700"
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
          
          {/* Participant Photo Section */}
          <div className="md:col-span-3 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            {form.dynamicData?.Photo ? (
              <div className="flex flex-col items-center gap-3">
                <img 
                  src={form.dynamicData.Photo} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <label className="cursor-pointer text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Upload Photo
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 1MB</p>
                </div>
              </div>
            )}
          </div>
          
          <input className="p-3 border rounded-xl" placeholder="Name *" value={form.name} onChange={e => handleChange("name", e.target.value)} />
          <input className="p-3 border rounded-xl" placeholder="Phone *" value={form.phone} onChange={e => handleChange("phone", e.target.value)} />
          <input className="p-3 border rounded-xl" placeholder="Email" value={form.email} onChange={e => handleChange("email", e.target.value)} />
          <input className="p-3 border rounded-xl" placeholder="State" value={form.state} onChange={e => handleChange("state", e.target.value)} />
          <select className="p-3 border rounded-xl" value={form.category} onChange={e => handleCategoryChange(e.target.value)}>
            <option value="" disabled>Category *</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="ADD_NEW" className="text-blue-600 font-bold">+ Add New</option>
          </select>
          <input className="p-3 border rounded-xl" placeholder="Medical Council Number" value={form.medicalCouncilNumber} onChange={e => handleChange("medicalCouncilNumber", e.target.value)} />
          <input className="p-3 border rounded-xl md:col-span-3" placeholder="Reference" value={form.reference} onChange={e => handleChange("reference", e.target.value)} />
        </div>

        {/* Optimized Blocking Access Layout */}
        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <h3 className="font-bold text-rose-900 mb-4 text-lg">Access Control</h3>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><input type="checkbox" checked={form.blockKitbag} onChange={e => handleChange("blockKitbag", e.target.checked)} /> Block Kitbag</label>
            <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border"><input type="checkbox" checked={form.blockCertificate} onChange={e => handleChange("blockCertificate", e.target.checked)} /> Block Certificate</label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(d => (
              <div key={d} className="bg-white p-3 rounded-xl border border-rose-100">
                <p className="font-bold text-rose-800 text-xs mb-2">DAY {d}</p>
                {["Breakfast", "Lunch", "Dinner"].map(m => (
                  <label key={m} className="flex items-center gap-2 text-xs py-1"><input type="checkbox" checked={!!form[`blockDay${d}${m}` as keyof Participant]} onChange={e => handleChange(`blockDay${d}${m}` as keyof Participant, e.target.checked)} /> {m}</label>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-rose-200">
            <p className="font-bold text-rose-800 text-sm mb-3">WORKSHOPS</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(w => (
                <label key={w} className="flex items-center justify-center gap-2 bg-white p-3 rounded-lg border font-bold text-xs"><input type="checkbox" checked={!!form[`blockWorkshop${w}` as keyof Participant]} onChange={e => handleChange(`blockWorkshop${w}` as keyof Participant, e.target.checked)} /> Workshop {w}</label>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleSubmit} className="w-full mt-8 p-4 bg-slate-900 text-white rounded-xl font-bold">Save Changes</button>
      </div>
    </div>
  );
};

export default ParticipantPage;