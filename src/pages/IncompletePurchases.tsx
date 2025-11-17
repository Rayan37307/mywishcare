
import { useState, useEffect } from 'react';

const IncompletePurchasesPage = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchases, setPurchases] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const storedPurchases = localStorage.getItem('incompletePurchases');
      if (storedPurchases) {
        setPurchases(JSON.parse(storedPurchases));
      }
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'wcbd') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Access</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Enter password"
            />
            <button type="submit" className="w-full bg-blue-500 text-white mt-4 px-4 py-2 rounded-lg">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Incomplete Purchases</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="w-1/12 text-left py-3 px-4 uppercase font-semibold text-sm">#</th>
              <th className="w-3/12 text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
              <th className="w-6/12 text-left py-3 px-4 uppercase font-semibold text-sm">Customer</th>
              <th className="w-2/12 text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {purchases.map((purchase, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{new Date(purchase.date).toLocaleString()}</td>
                <td className="py-3 px-4">{purchase.formData.firstName} {purchase.formData.lastName}</td>
                <td className="py-3 px-4">
                  <button className="bg-blue-500 text-white px-4 py-1 rounded-lg">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncompletePurchasesPage;
