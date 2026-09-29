import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { BASE_URL } from '../../api/axios';
import './Categories.css';

// High quality image URLs
const IMAGES = {
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=100&q=80',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=100&q=80',
  staples: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=100&q=80',
  beverages: 'https://images.unsplash.com/photo-1527960471264-932f39eb5846?auto=format&fit=crop&w=100&q=80',
  snacks: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=100&q=80',
  personalCare: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=100&q=80',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=150&q=80',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=150&q=80',
  potato: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=150&q=80',
  tomato: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=150&q=80',
  onion: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=150&q=80',
  orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=150&q=80',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=150&q=80',
};

const TIMEFRAME_RANGES = {
  'This Month': 'this_month',
  'Last Month': 'last_month',
  'Last 3 Months': 'last_3_months',
};

const Categories = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Month');
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [cart, setCart] = useState({});
  const [activeModal, setActiveModal] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [spending, setSpending] = useState({ total: 0, points: [] });
  const [loading, setLoading] = useState(true);
  const [addingProductId, setAddingProductId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    Promise.allSettled([
      API.get('/dashboard/categories'),
      API.get('/dashboard/recommended'),
      API.get('/dashboard/offers'),
    ]).then((results) => {
      if (!active) return;
      const [categoryResult, recommendedResult, offersResult] = results;
      if (categoryResult.status === 'fulfilled') {
        setCategoriesData(categoryResult.value.data?.data || []);
      }
      if (recommendedResult.status === 'fulfilled') {
        setRecommendedItems(recommendedResult.value.data?.data || []);
      }
      if (offersResult.status === 'fulfilled') {
        setOffers(offersResult.value.data?.data || []);
      }
      if (results.some((result) => result.status === 'rejected')) {
        const failed = results.find((result) => result.status === 'rejected');
        setError(failed.reason.response?.data?.message || 'Some dashboard details could not be loaded.');
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    API.get('/dashboard/spending', { params: { range: TIMEFRAME_RANGES[selectedTimeframe] } })
      .then(({ data }) => {
        if (active && data.success) setSpending(data.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load spending data.');
      });

    return () => { active = false; };
  }, [selectedTimeframe]);

  const currentDataset = {
    total: spending.total,
    points: spending.points || [],
  };

  // Helper function to map data points to SVG coordinate space
  const svgWidth = 300;
  const svgHeight = 130;
  const maxVal = Math.max(1000, Math.ceil(Math.max(...currentDataset.points.map((pt) => pt.amount), 0) / 1000) * 1000);

  const pointsCoordinates = currentDataset.points.map((pt, i, arr) => {
    const x = arr.length === 1 ? svgWidth / 2 : 10 + (i / (arr.length - 1)) * (svgWidth - 20);
    const y = svgHeight - (pt.amount / maxVal) * (svgHeight - 20) - 10;
    return { x, y, ...pt };
  });

  // Generate smooth SVG Bezier Spline path string
  const generateSmoothPath = (pts) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX},${p0.y} ${cpX},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const linePathD = generateSmoothPath(pointsCoordinates);
  const areaPathD = pointsCoordinates.length
    ? `${linePathD} L ${pointsCoordinates[pointsCoordinates.length - 1].x},${svgHeight} L ${pointsCoordinates[0].x},${svgHeight} Z`
    : '';

  const formatCurrency = (value) => `₹${(Number(value) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const getImageUrl = (image) => {
    if (!image) return '';
    if (typeof image === 'object') image = image.url || image.path || image.secure_url || image.src || '';
    if (!image) return '';
    return /^https?:\/\//i.test(image) ? image : `${BASE_URL}${image.startsWith('/') ? image : `/${image}`}`;
  };

  const getCategoryImage = (category) => {
    const name = category.name.toLowerCase();
    const fallback = name.includes('fruit') || name.includes('vegetable') ? IMAGES.fruits
      : name.includes('dairy') || name.includes('bakery') ? IMAGES.dairy
        : name.includes('beverage') ? IMAGES.beverages
          : name.includes('snack') ? IMAGES.snacks
            : name.includes('personal') ? IMAGES.personalCare
              : IMAGES.staples;
    return getImageUrl(category.image) || fallback;
  };

  const handleAddToCart = async (productId) => {
    try {
      setAddingProductId(productId);
      setError('');
      await API.post('/cart/add', { productId, quantity: 1 });
      setCart((prev) => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to add this product to your cart.');
    } finally {
      setAddingProductId(null);
    }
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="dashboard-container">
      {error && <p role="alert">{error}</p>}
      {/* Top Grid Section */}
      <div className="top-grid">
        
        {/* Card 1: Categories You Buy */}
        <div className="dashboard-card categories-card">
          <div className="card-header">
            <h3>Categories You Buy</h3>
            <button className="view-all-btn" onClick={() => setActiveModal('categories')}>
              View All <span className="arrow">→</span>
            </button>
          </div>
          <div className="categories-list">
            {categoriesData.length ? categoriesData.slice(0, 4).map((cat) => (
              <div key={cat.name} className="category-item">
                <div className="category-img-wrapper">
                  <img src={getCategoryImage(cat)} alt={cat.name} />
                </div>
                <div className="category-details">
                  <span className="category-name">{cat.name}</span>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${cat.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="category-percentage">{cat.percentage}%</span>
              </div>
            )) : <p>{loading ? 'Loading categories...' : 'No purchase categories yet.'}</p>}
          </div>
        </div>

        {/* Card 2: Interactive Live Monthly Spending Chart */}
        <div className="dashboard-card spending-card">
          <div className="card-header">
            <h3>Monthly Spending</h3>
            <select
              className="timeframe-select"
              value={selectedTimeframe}
              onChange={(e) => {
                setSelectedTimeframe(e.target.value);
                setHoveredPointIndex(null);
              }}
            >
              <option value="This Month">This Month</option>
              <option value="Last Month">Last Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
          </div>

          <div className="spending-summary">
            <h2 className="amount">{formatCurrency(currentDataset.total)}</h2>
            <div className="spending-badge">
              <span>{selectedTimeframe}</span>
            </div>
          </div>

          {/* Fully Interactive Live Graph Chart */}
          <div className="chart-wrapper">
            <div className="y-axis">
              <span>₹{maxVal.toLocaleString('en-IN')}</span>
              <span>₹{Math.round(maxVal * 2 / 3).toLocaleString('en-IN')}</span>
              <span>₹{Math.round(maxVal / 3).toLocaleString('en-IN')}</span>
              <span>₹0</span>
            </div>
            
            <div className="chart-container">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="chart-svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                <line x1="0" y1="10" x2={svgWidth} y2="10" className="grid-line" />
                <line x1="0" y1="50" x2={svgWidth} y2="50" className="grid-line" />
                <line x1="0" y1="90" x2={svgWidth} y2="90" className="grid-line" />
                <line x1="0" y1="120" x2={svgWidth} y2="120" className="grid-line" />

                {pointsCoordinates.length > 0 && <path d={areaPathD} fill="url(#chartGradient)" />}

                {/* Main Graph Curved Line */}
                {pointsCoordinates.length > 0 && (
                  <path
                    d={linePathD}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="smooth-path"
                  />
                )}

                {/* Interactive Points with Hover Tooltips */}
                {pointsCoordinates.map((pt, idx) => {
                  const isHovered = hoveredPointIndex === idx;
                  const isLastPoint = idx === pointsCoordinates.length - 1;

                  return (
                    <g key={idx} className="chart-point-group">
                      {/* Vertical Indicator Line on Hover */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1="10"
                          x2={pt.x}
                          y2={svgHeight}
                          stroke="#22c55e"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      )}

                      {/* Interactive Hover Circle Trigger */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : isLastPoint ? 4 : 3}
                        className={`chart-circle ${isHovered ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredPointIndex(idx)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      />

                      {/* Custom Tooltip */}
                      {isHovered && (
                        <g transform={`translate(${Math.min(Math.max(pt.x - 35, 0), svgWidth - 70)}, ${Math.max(pt.y - 35, 5)})`}>
                          <rect width="70" height="25" rx="5" fill="#1e293b" opacity="0.9" />
                          <text x="35" y="16" fill="#ffffff" fontSize="9" textAnchor="middle" fontWeight="bold">
                            ₹{pt.amount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Dynamic X-Axis Labels */}
              <div className="x-axis">
                {currentDataset.points.length ? currentDataset.points.map((pt, idx) => (
                  <span
                    key={idx}
                    className={hoveredPointIndex === idx ? 'active-label' : ''}
                    onMouseEnter={() => setHoveredPointIndex(idx)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                  >
                    {pt.date}
                  </span>
                )) : <span>No spending in this period.</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Exclusive Banner Offers */}
        <div className="dashboard-card exclusive-card">
          <div className="card-header">
            <h3>Exclusive For You</h3>
            <button className="view-all-btn" onClick={() => setActiveModal('offers')}>
              View All <span className="arrow">→</span>
            </button>
          </div>

          <div className="offers-container">
            {offers.length ? offers.slice(0, 2).map((offer) => (
              <div className="offer-banner green-banner" key={offer.id}>
                <div className="offer-icon yellow-icon"><span>%</span></div>
                <div className="offer-info">
                  <h4>{offer.code || 'Offer'}</h4>
                  <p>{offer.description || `${offer.discountValue || 0}${offer.discountType === 'percentage' ? '% off' : ' discount'}`}</p>
                  <button className="offer-action-btn" onClick={() => navigate('/shop')}>Shop Now</button>
                </div>
              </div>
            )) : <p>{loading ? 'Loading offers...' : 'No active offers right now.'}</p>}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recommended for You */}
      <div className="dashboard-card recommended-card">
        <div className="card-header">
          <h3>Recommended for You</h3>
          <button className="view-all-btn" onClick={() => setActiveModal('recommended')}>
            View All <span className="arrow">→</span>
          </button>
        </div>

        <div className="recommended-grid">
          {recommendedItems.length ? recommendedItems.slice(0, 5).map((item) => (
            <div key={item.id} className="product-card">
              <div className="product-image-container">
                {getImageUrl(item.image) && <img src={getImageUrl(item.image)} alt={item.name} />}
              </div>
              <div className="product-details">
                <h4 className="product-title">{item.name}</h4>
                <span className="product-unit">{item.unit}</span>
                <div className="product-footer">
                  <span className="product-price">{formatCurrency(item.price)}</span>
                  <button
                    className={`add-btn ${cart[item.id] ? 'added' : ''}`}
                    onClick={() => handleAddToCart(item.id)}
                    disabled={addingProductId === item.id}
                    title="Add to Cart"
                  >
                    {addingProductId === item.id ? '…' : cart[item.id] ? `+${cart[item.id]}` : '+'}
                  </button>
                </div>
              </div>
            </div>
          )) : <p>{loading ? 'Loading recommendations...' : 'No recommendations available yet.'}</p>}
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>✕</button>

            {activeModal === 'categories' && (
              <div className="modal-body">
                <h2>All Purchased Categories</h2>
                <div className="modal-list">
                  {categoriesData.map((cat) => (
                    <div key={cat.name} className="modal-item">
                      <img src={getCategoryImage(cat)} alt={cat.name} className="modal-item-img" />
                      <div className="modal-item-info">
                        <h4>{cat.name}</h4>
                        <p>Total Spent: {formatCurrency(cat.totalSpent)}</p>
                      </div>
                      <span className="modal-badge">{cat.percentage}% share</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModal === 'offers' && (
              <div className="modal-body">
                <h2>Active Offers & Coupons</h2>
                <div className="offers-modal-grid">
                  {offers.length ? offers.map((offer) => (
                    <div className="coupon-card" key={offer.id}>
                      <h3>{offer.code}</h3>
                      <p>{offer.description || `${offer.discountValue || 0}${offer.discountType === 'percentage' ? '% off' : ' discount'}`}</p>
                      <button className="apply-coupon-btn" onClick={() => navigate('/shop')}>Shop Now</button>
                    </div>
                  )) : <p>No active offers right now.</p>}
                </div>
              </div>
            )}

            {activeModal === 'recommended' && (
              <div className="modal-body">
                <h2>All Recommended Products</h2>
                <div className="recommended-grid modal-grid">
                  {recommendedItems.map((item) => (
                    <div key={item.id} className="product-card">
                      <div className="product-image-container">
                        {getImageUrl(item.image) && <img src={getImageUrl(item.image)} alt={item.name} />}
                      </div>
                      <div className="product-details">
                        <h4 className="product-title">{item.name}</h4>
                        <span className="product-unit">{item.unit}</span>
                        <div className="product-footer">
                          <span className="product-price">{formatCurrency(item.price)}</span>
                          <button
                            className={`add-btn ${cart[item.id] ? 'added' : ''}`}
                            onClick={() => handleAddToCart(item.id)}
                            disabled={addingProductId === item.id}
                          >
                            {addingProductId === item.id ? '…' : cart[item.id] ? `+${cart[item.id]}` : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;