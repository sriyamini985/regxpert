import { useRef, useState } from "react";

const ParticipantPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    state: "",
    category: "",
    reference: "",
    medicalCouncilNumber: "",
  });

  // PREDEFINED CATEGORIES
  const [categories, setCategories] = useState([
    "Delegates",
    "PG Delegates",
    "Accompanying Person",
    "Chairman",
    "Vice President",
  ]);

  const [newCategory, setNewCategory] = useState("");

  // ADD NEW CATEGORY
  const handleAddCategory = () => {
    if (
      newCategory.trim() !== "" &&
      !categories.includes(newCategory)
    ) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-md rounded-2xl p-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">

            <div className="w-12 h-12 bg-blue-500 rounded-lg"></div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Delegate
              </h2>

              <p className="text-gray-500 text-xs">
                Register a New Delegate
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Register Here
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* FULL NAME */}
          <div>
            <label className="text-xs text-gray-600">
              Full Name
            </label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Enter Full Name"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* MOBILE */}
          <div>
            <label className="text-xs text-gray-600">
              Mobile Number
            </label>

            <input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              placeholder="Enter Mobile Number"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs text-gray-600">
              Email Address
            </label>

            <input
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="Enter Email Address"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* STATE */}
          <div>
            <label className="text-xs text-gray-600">
              State / City
            </label>

            <input
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
              placeholder="Enter State or City"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* MEDICAL COUNCIL NUMBER */}
          <div>
            <label className="text-xs text-gray-600">
              Medical Council Number
            </label>

            <input
              value={form.medicalCouncilNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  medicalCouncilNumber: e.target.value,
                })
              }
              placeholder="Enter Medical Council Number"
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-xs text-gray-600">
              Category
            </label>

            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Category</option>

              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* ADD NEW CATEGORY */}
          <div className="md:col-span-2">
            <label className="text-xs text-gray-600">
              Add New Category
            </label>

            <div className="flex gap-3 mt-1">

              <input
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value)
                }
                placeholder="Enter New Category"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add
              </button>

            </div>
          </div>

          {/* REFERENCE + IMPORT */}
          <div className="md:col-span-2 flex gap-4 items-end">

            <div className="flex-1">
              <label className="text-xs text-gray-600">
                Reference
              </label>

              <input
                value={form.reference}
                onChange={(e) =>
                  setForm({
                    ...form,
                    reference: e.target.value,
                  })
                }
                placeholder="Enter Reference"
                className="w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* IMPORT BUTTON */}
            <div>
              <input
                type="file"
                ref={fileRef}
                accept=".csv, .xlsx"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-[42px] px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Import Excel
              </button>
            </div>

          </div>

        </div>

        {/* SUBMIT */}
        <div className="mt-6">
          <button className="w-full py-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Complete Registration
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParticipantPage;