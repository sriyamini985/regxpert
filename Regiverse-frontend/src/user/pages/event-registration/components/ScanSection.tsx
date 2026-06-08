import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

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

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '9876543210',
    regId: 'REG12345',
    city: 'New York',
    category: 'Delegate',
    checkedIn: false,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '9123456780',
    regId: 'REG67890',
    city: 'London',
    category: 'VIP',
    checkedIn: false,
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '9988776655',
    regId: 'REG54321',
    city: 'Mumbai',
    category: 'Speaker',
    checkedIn: false,
  },
];

const ScanSection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const day = searchParams.get('day');
  const meal = searchParams.get('meal');

  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<User[]>([]);

  // 🔊 Beep sound
  const playBeep = () => {
    const audio = new Audio(
      'https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'
    );
    audio.play();
  };

  // ✅ CHECK-IN
  const handleCheckIn = (id: string) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, checkedIn: true } : u
    );
    setUsers(updated);

    // update results live
    handleSearch(search, updated);
  };

  // 📷 AUTO SCAN (unchanged logic, improved matching)
  const startScanner = () => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        const found = users.find(
          (u) =>
            u.id === decodedText ||
            u.regId === decodedText ||
            u.phone === decodedText
        );

        if (found) {
          playBeep();
          handleCheckIn(found.id);
          setResults([found]);
        }

        scanner.clear();
      },
      (error) => console.log(error)
    );
  };

  // 🔍 GLOBAL SEARCH (ALL FIELDS)
  const handleSearch = (value: string, data = users) => {
    setSearch(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    const lower = value.toLowerCase();

    const filtered = data.filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(lower)
      )
    );

    setResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-24">
      <h1 className="text-xl font-bold mb-4 text-center">
        Day {day} - {meal}
      </h1>

      {/* AUTO SCAN */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Auto Scan</h2>

        <button
          onClick={startScanner}
          className="w-full bg-blue-500 text-white py-2 rounded mb-3"
        >
          Start QR Scanner
        </button>

        <div id="reader"></div>
      </div>

      {/* MANUAL SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <h2 className="font-semibold mb-2">Manual Search</h2>

        <input
          type="text"
          placeholder="Search anything (name, phone, regId, city...)"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* TABLE RESULTS (like your screenshot) */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left sticky left-0 bg-gray-100 z-10">
                  Action
                </th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Reg ID</th>
                <th className="p-3 text-left">City</th>
                <th className="p-3 text-left">Category</th>
              </tr>
            </thead>

            <tbody>
              {results.map((user) => (
                <tr key={user.id} className="border-t">

                  {/* ✅ FIRST COLUMN CHECK-IN */}
                  <td className="p-3 sticky left-0 bg-white z-10">
                    <button
                      onClick={() => handleCheckIn(user.id)}
                      disabled={user.checkedIn}
                      className={`px-3 py-1 text-xs rounded ${
                        user.checkedIn
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                    >
                      {user.checkedIn ? 'Checked' : 'Check-In'}
                    </button>
                  </td>

                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.phone}</td>
                  <td className="p-3">{user.regId}</td>
                  <td className="p-3">{user.city}</td>
                  <td className="p-3">{user.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScanSection;