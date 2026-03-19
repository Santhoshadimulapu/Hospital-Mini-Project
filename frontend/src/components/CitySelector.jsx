import { useState } from 'react';
import { FiMapPin, FiSearch } from 'react-icons/fi';

const CITIES = [
  { name: 'Bangalore', icon: '🏙️' },
  { name: 'Mumbai', icon: '🌊' },
  { name: 'Delhi', icon: '🏛️' },
  { name: 'Chennai', icon: '⛪' },
  { name: 'Hyderabad', icon: '🕌' },
  { name: 'Pune', icon: '🏔️' },
  { name: 'Kolkata', icon: '🌉' },
  { name: 'Ahmedabad', icon: '🏗️' },
  { name: 'Jaipur', icon: '🏰' },
  { name: 'Lucknow', icon: '🕋' },
  { name: 'Kochi', icon: '🌴' },
  { name: 'Chandigarh', icon: '🌳' },
  { name: 'Coimbatore', icon: '🏭' },
  { name: 'Indore', icon: '🍜' },
  { name: 'Vizag', icon: '🏖️' },
  { name: 'Nagpur', icon: '🍊' },
];

const POPULAR = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Pune'];

export default function CitySelector({ onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? CITIES.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : CITIES;

  const popular = CITIES.filter((c) => POPULAR.includes(c.name));

  return (
    <div className="city-overlay">
      <div className="city-modal">
        <div className="city-modal-header">
          <FiMapPin size={24} color="var(--primary)" />
          <div>
            <h2>Select Your City</h2>
            <p>Find doctors and hospitals near you</p>
          </div>
        </div>

        <div className="city-search">
          <FiSearch size={18} />
          <input
            type="text"
            placeholder="Search for your city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {!search && (
          <>
            <h4 className="city-section-title">Popular Cities</h4>
            <div className="city-popular-grid">
              {popular.map((city) => (
                <button
                  key={city.name}
                  className="city-popular-btn"
                  onClick={() => onSelect(city.name)}
                >
                  <span className="city-emoji">{city.icon}</span>
                  <span>{city.name}</span>
                </button>
              ))}
            </div>

            <h4 className="city-section-title">All Cities</h4>
          </>
        )}

        <div className="city-list">
          {filtered.length === 0 ? (
            <p className="city-empty">No cities found for "{search}"</p>
          ) : (
            filtered.map((city) => (
              <button
                key={city.name}
                className="city-list-item"
                onClick={() => onSelect(city.name)}
              >
                <FiMapPin size={16} />
                <span>{city.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export { CITIES };
