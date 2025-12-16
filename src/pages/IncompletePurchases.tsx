import { useState, useEffect } from 'react';
import { woocommerceService,  } from '../services/woocommerceService';
import type { Order } from '../services/woocommerceService';

const IncompletePurchasesPage = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<Order | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      // Fetch only existing incomplete orders - no new orders should be created here
      woocommerceService.getIncompleteOrders().then(orders => {
        setPurchases(orders);
      });
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

  const handleViewClick = (purchase: Order) => {
    setSelectedPurchase(purchase);
  };

  const closeModal = () => {
    setSelectedPurchase(null);
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
                <td className="py-3 px-4">{new Date(purchase.date_created).toLocaleString()}</td>
                <td className="py-3 px-4">{purchase.billing.first_name}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleViewClick(purchase)} className="bg-blue-500 text-white px-4 py-1 rounded-lg">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPurchase && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/2">
            <h2 className="text-2xl font-bold mb-4">Purchase Details</h2>
            <p><strong>Date:</strong> {new Date(selectedPurchase.date_created).toLocaleString()}</p>
            <p><strong>Name:</strong> {selectedPurchase.billing.first_name}</p>
            <p><strong>Address:</strong> {selectedPurchase.billing.address_1}</p>
            <p><strong>District:</strong> {selectedPurchase.billing.state}</p>
            <p><strong>Phone:</strong> {selectedPurchase.billing.phone}</p>
            <p><strong>Email:</strong> {selectedPurchase.billing.email}</p>
            <h3 className="text-xl font-bold mt-4">Items</h3>
            <ul>
              {selectedPurchase.line_items.map(item => (
                <li key={item.id}>{item.name} x {item.quantity}</li>
              ))}
            </ul>
            <button onClick={closeModal} className="w-full bg-red-500 text-white mt-4 px-4 py-2 rounded-lg">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncompletePurchasesPage;
