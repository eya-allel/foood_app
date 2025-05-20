import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Caterers = () => {
  const [caterers, setCaterers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaterers = async () => {
      try {
        const response = await api.get('/auth/caterers');
        setCaterers(response.data.caterers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch caterers');
        setLoading(false);
      }
    };

    fetchCaterers();
  }, []);

  if (loading) {
    return <div className="p-4">Loading caterers...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  const handleCatererClick = (id) => {
    navigate(`/caterers/${id}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Caterers</h1>
      {caterers.length === 0 ? (
        <p>No caterers found.</p>
      ) : (
        <ul className="space-y-2">
          {caterers.map((caterer) => (
            <li
              key={caterer._id}
              className="border p-3 rounded shadow-sm cursor-pointer hover:bg-gray-100"
              onClick={() => handleCatererClick(caterer._id)}
            >
              <p className="font-semibold">{caterer.username}</p>
              <p className="text-gray-600">{caterer.businessName}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Caterers;
