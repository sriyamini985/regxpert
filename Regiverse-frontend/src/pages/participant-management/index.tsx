import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
  const fileRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const location = useLocation();

  const state = location.state as LocationState;

  const editingPerson = state?.person;

  const [categories, setCategories] =
    useState<string[]>(defaultCategories);

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
     LOAD EDIT DATA
  ========================= */
  useEffect(() => {
    if (editingPerson) {
      setForm(editingPerson);
    }
  }, [editingPerson]);

  /* =========================
     HANDLE INPUT
  ========================= */
  const handleChange = (
    key: keyof Participant,
    value: any
  ) => {
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

  try {
    const payload = {
      ...form,
    };

    const url = editingPerson
      ? `http://localhost:5000/api/participants/${form._id || form.id}`
      : "http://localhost:5000/api/participants";

    const res = await fetch(url, {
      method: editingPerson ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();

    console.log("SERVER RESPONSE:", text);

    let result: any = {};

    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error("RAW SERVER RESPONSE:", text);

      if (text.startsWith("<!DOCTYPE")) {
        throw new Error(
          "Backend API route not found. Check backend URL."
        );
      }

      throw new Error(text);
    }

    if (!res.ok) {
      throw new Error(
        result.message || "Failed"
      );
    }

    alert(
      editingPerson
        ? "✅ Delegate Updated"
        : "✅ Delegate Registered"
    );

    navigate("/conferences");

  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
};
  /* =========================
     IMPORT EXCEL
  ========================= */
  const handleImport = async (e: any) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const XLSX = await import("xlsx");

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data);

      let json: any[] = [];

      workbook.SheetNames.forEach(
        (sheetName) => {
          const sheet =
            workbook.Sheets[sheetName];

          const sheetData =
            XLSX.utils.sheet_to_json(sheet);

          json = [...json, ...sheetData];
        }
      );

      const formatted = json.map(
        (item: any) => {
          const normalized: any = {};

          Object.keys(item).forEach((key) => {
            normalized[
              key.trim().toLowerCase()
            ] = item[key];
          });

          return {
            name:
              normalized.name || "",
            email:
              normalized.email || "",
            phone:
              normalized.phone || "",
            state:
              normalized.state || "",
            category:
              normalized.category || "",
            reference:
              normalized.reference || "",
            medicalCouncilNumber:
              normalized[
                "medical council number"
              ] || "",
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
          };
        }
      );

      const res = await fetch(
        "http://localhost:5000/api/participants/bulk",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(formatted),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(
          result.message || "Import failed"
        );
      }

      alert(
        `✅ Imported ${result.inserted} participants`
      );

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
              {editingPerson
                ? "Edit Delegate"
                : "Add New Delegate"}
            </h2>

            <p className="text-sm text-gray-500">
              Conference Registration
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <input
            placeholder="Full Name *"
            value={form.name}
            onChange={(e) =>
              handleChange(
                "name",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Mobile Number *"
            value={form.phone}
            onChange={(e) =>
              handleChange(
                "phone",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Email Address *"
            value={form.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="State / City *"
            value={form.state}
            onChange={(e) =>
              handleChange(
                "state",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border rounded-xl"
          />

          <input
            placeholder="Medical Council Number *"
            value={form.medicalCouncilNumber}
            onChange={(e) =>
              handleChange(
                "medicalCouncilNumber",
                e.target.value
              )
            }
            className="w-full px-4 py-3 border rounded-xl md:col-span-2"
          />

          {/* CATEGORY */}
          <div className="md:col-span-2">
            <select
              value={form.category}
              onChange={(e) => {
                if (
                  e.target.value ===
                  "__add_new__"
                ) {
                  const category = prompt(
                    "Enter New Category"
                  );

                  if (
                    category &&
                    !categories.includes(
                      category
                    )
                  ) {
                    setCategories([
                      ...categories,
                      category,
                    ]);

                    handleChange(
                      "category",
                      category
                    );
                  }

                  return;
                }

                handleChange(
                  "category",
                  e.target.value
                );
              }}
              className="w-full px-4 py-3 border rounded-xl"
            >
              <option value="">
                Select Category *
              </option>

              {categories.map(
                (cat, index) => (
                  <option
                    key={index}
                    value={cat}
                  >
                    {cat}
                  </option>
                )
              )}

              <option value="__add_new__">
                + Add New Category
              </option>
            </select>
          </div>

          <input
            placeholder="Reference *"
            value={form.reference}
            onChange={(e) =>
              handleChange(
                "reference",
                e.target.value
              )
            }
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

            {/* KITBAG + CERTIFICATE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <label className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm">
                <input
                  type="checkbox"
                  checked={
                    form.blockKitbag
                  }
                  onChange={(e) =>
                    handleChange(
                      "blockKitbag",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

                <div>
                  <p className="font-semibold text-gray-800">
                    Block Kitbag
                  </p>

                  <p className="text-sm text-gray-500">
                    Participant cannot collect
                    kitbag
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm">
                <input
                  type="checkbox"
                  checked={
                    form.blockCertificate
                  }
                  onChange={(e) =>
                    handleChange(
                      "blockCertificate",
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

                <div>
                  <p className="font-semibold text-gray-800">
                    Block Certificate
                  </p>

                  <p className="text-sm text-gray-500">
                    Certificate access denied
                  </p>
                </div>
              </label>
            </div>

            {/* FOOD */}
            <div className="mt-10">

              <h3 className="text-xl font-bold text-red-900 mb-6">
                Food Restrictions
              </h3>

              <div className="space-y-5">

                {[1, 2, 3, 4, 5].map(
                  (day) => (
                    <div
                      key={day}
                      className="bg-white border rounded-2xl p-5 shadow-sm"
                    >
                      <h4 className="font-semibold text-gray-800 mb-4">
                        Day {day}
                      </h4>

                      <div className="flex flex-wrap gap-6">

                        {[
                          "Breakfast",
                          "Lunch",
                          "Dinner",
                        ].map((meal) => {
                          const key =
                            `blockDay${day}${meal}` as keyof Participant;

                          return (
                            <label
                              key={meal}
                              className="flex items-center gap-3"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  form[
                                    key
                                  ] as boolean
                                }
                                onChange={(
                                  e
                                ) =>
                                  handleChange(
                                    key,
                                    e.target
                                      .checked
                                  )
                                }
                                className="w-5 h-5"
                              />

                              <span className="text-gray-700">
                                Block {meal}
                              </span>
                            </label>
                          );
                        })}

                      </div>
                    </div>
                  )
                )}

              </div>
            </div>

            {/* WORKSHOPS */}
            <div className="mt-10">

              <h3 className="text-xl font-bold text-red-900 mb-6">
                Workshop Restrictions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {[1, 2, 3, 4, 5].map(
                  (num) => {
                    const key =
                      `blockWorkshop${num}` as keyof Participant;

                    return (
                      <label
                        key={num}
                        className="flex items-center gap-4 bg-white border rounded-2xl p-5 shadow-sm"
                      >
                        <input
                          type="checkbox"
                          checked={
                            form[
                              key
                            ] as boolean
                          }
                          onChange={(e) =>
                            handleChange(
                              key,
                              e.target
                                .checked
                            )
                          }
                          className="w-5 h-5"
                        />

                        <div>
                          <p className="font-semibold text-gray-800">
                            Block Workshop{" "}
                            {num}
                          </p>

                          <p className="text-sm text-gray-500">
                            Deny workshop
                            access
                          </p>
                        </div>
                      </label>
                    );
                  }
                )}

              </div>
            </div>

          </div>

          {/* IMPORT */}
          {!editingPerson && (
            <div className="md:col-span-2 flex justify-end">
              <input
                type="file"
                ref={fileRef}
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleImport}
              />

              <button
                onClick={() =>
                  fileRef.current?.click()
                }
                className="px-5 py-3 bg-blue-600 text-white rounded-xl"
              >
                Import Excel
              </button>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <div className="mt-8">
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-medium"
          >
            {editingPerson
              ? "Update Delegate"
              : "Complete Registration"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ParticipantPage;

