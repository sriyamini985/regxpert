import { useState, useMemo } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  regId: string;
  city: string;
  category: string;
  checkedIn: boolean;
}

interface Props {
  users: User[];
  onCheckIn: (id: string) => void;
}

const ManualEntry = ({ users, onCheckIn }: Props) => {
  const [search, setSearch] = useState('');

  const results = useMemo(() => {
    if (!search.trim()) return [];

    const q = search.toLowerCase();

    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.regId.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.category.toLowerCase().includes(q)
    );
  }, [search, users]);

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-3">Manual Search</h2>

      <input
        type="text"
        placeholder="Search anything..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      {/* RESULTS TABLE */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2">Action</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Reg ID</th>
                <th className="p-2">City</th>
                <th className="p-2">Category</th>
              </tr>
            </thead>

            <tbody>
              {results.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">
                    <button
                      onClick={() => onCheckIn(u.id)}
                      disabled={u.checkedIn}
                      className={`px-2 py-1 text-xs rounded ${
                        u.checkedIn
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {u.checkedIn ? 'Checked' : 'Check-In'}
                    </button>
                  </td>

                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.phone}</td>
                  <td className="p-2">{u.regId}</td>
                  <td className="p-2">{u.city}</td>
                  <td className="p-2">{u.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManualEntry;