import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './QualityInspection.css';

const QualityInspection = ({ returnIdProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeParamId } = useParams();

  const [inspector, setInspector] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdatingInspector, setIsUpdatingInspector] = useState(false);

  const targetReturnId = returnIdProp || location.state?.returnData?.id || routeParamId || 'RET-2026-00124';

  useEffect(() => {
    const fetchInspectionData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Optimistic Load from Router State
        const passedData = location.state?.returnData;
        if (passedData?.inspectionDetails && passedData.id === targetReturnId) {
          const passedInspection = passedData.inspectionDetails;
          const resolvedData = {
            inspectorName: passedInspection.inspectorName || passedData.assignedTo || 'Unassigned',
            inspectionDate: passedInspection.inspectionDate || `${passedData.date || '20 May 2026'} ${passedData.time || '10:00 AM'}`.trim(),
            warehouse: passedInspection.warehouse || 'Central Warehouse',
            productCondition: passedInspection.productCondition || 'Damaged',
            productConditionColor: passedInspection.productConditionColor || 'red',
            packagingCondition: passedInspection.packagingCondition || 'Fair',
            packagingConditionColor: passedInspection.packagingConditionColor || 'orange',
            packaged: passedInspection.packaged || 'Yes',
            packagedColor: passedInspection.packagedColor || 'green',
            accessoriesAvailable: passedInspection.accessoriesAvailable || 'Missing',
            accessoriesColor: passedInspection.accessoriesColor || 'red',
            barcodeVerified: passedInspection.barcodeVerified || 'Yes',
            barcodeColor: passedInspection.barcodeColor || 'green',
            expiryChecked: passedInspection.expiryChecked || 'N/A',
            expiryColor: passedInspection.expiryColor || 'gray',
            photos: passedInspection.photos || ['https://via.placeholder.com/80?text=Img1', 'https://via.placeholder.com/80?text=Img2'],
            extraPhotosCount: passedInspection.extraPhotosCount || 1,
            inspectionNotes: passedInspection.notes || 'Product arrived with broken seal and dented casing. Not suitable for restock.',
          };
          setData(resolvedData);
          setInspector(resolvedData.inspectorName);
          setLoading(false);
          return;
        }

        // 2. Mock API Fallback (Simulates backend response)
        setTimeout(() => {
          const mockData = {
            inspectorName: 'Rohit Das',
            inspectionDate: '20 May 2026 11:30 AM',
            warehouse: 'Delhi Main Warehouse',
            productCondition: 'Good',
            productConditionColor: 'green',
            packagingCondition: 'Minor Wear',
            packagingConditionColor: 'orange',
            packaged: 'Yes',
            packagedColor: 'green',
            accessoriesAvailable: 'Complete',
            accessoriesColor: 'green',
            barcodeVerified: 'Yes',
            barcodeColor: 'green',
            expiryChecked: 'Valid',
            expiryColor: 'green',
            photos: ['https://via.placeholder.com/80?text=Box', 'https://via.placeholder.com/80?text=Item'],
            extraPhotosCount: 0,
            inspectionNotes: 'Item is in good condition, suitable for restocking.',
          };
          setData(mockData);
          setInspector(mockData.inspectorName);
          setLoading(false);
        }, 600);

      } catch (err) {
        setError('Unable to load quality inspection record.');
        setLoading(false);
      }
    };

    fetchInspectionData();
  }, [targetReturnId, location.state]);

  const handleInspectorChange = async (e) => {
    const newInspector = e.target.value;
    const previousInspector = inspector;
    setInspector(newInspector);
    setIsUpdatingInspector(true);

    try {
      // Mocking the PATCH request delay
      await new Promise(resolve => setTimeout(resolve, 500));
      // throw new Error('Simulated failure'); // Uncomment to test rollback
    } catch (err) {
      setInspector(previousInspector); 
      alert('Failed to update inspector. Changes rolled back.');
    } finally {
      setIsUpdatingInspector(false);
    }
  };

  if (loading) return <div className="QualityInspection-container"><div className="QualityInspection-loading">Loading inspection data...</div></div>;
  
  if (error) return (
    <div className="QualityInspection-container">
      <button className="QualityInspection-back-btn" onClick={() => navigate(-1)}>← Back to Returns</button>
      <div className="QualityInspection-error-card"><h3>Error</h3><p>{error}</p></div>
    </div>
  );

  return (
    <div className="QualityInspection-container">
      <div className="QualityInspection-header">
        <button type="button" className="QualityInspection-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="QualityInspection-card">
        {/* Card Header */}
        <div className="QualityInspection-title-wrapper">
          <h2 className="QualityInspection-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Quality Inspection
          </h2>
          <span className="QualityInspection-id-badge">{targetReturnId}</span>
        </div>

        {/* Top Controls Bar */}
        <div className="QualityInspection-controls">
          <div className="QualityInspection-field">
            <label>Assigned Inspector</label>
            <div className="QualityInspection-select-wrapper">
              <select className="QualityInspection-select" value={inspector} onChange={handleInspectorChange} disabled={isUpdatingInspector}>
                <option value="Unassigned">Select Inspector</option>
                <option value="Rohit Das">Rohit Das</option>
                <option value="Neha Verma">Neha Verma</option>
                <option value="Amit Kumar">Amit Kumar</option>
              </select>
              {isUpdatingInspector && <span className="QualityInspection-spinner"></span>}
            </div>
          </div>

          <div className="QualityInspection-field">
            <label>Inspection Date</label>
            <input type="text" className="QualityInspection-input" value={data.inspectionDate} readOnly />
          </div>

          <div className="QualityInspection-field">
            <label>Warehouse</label>
            <input type="text" className="QualityInspection-input" value={data.warehouse} readOnly />
          </div>
        </div>

        {/* Details Grid */}
        <div className="QualityInspection-grid">
          {[
            { label: 'Product Condition', val: data.productCondition, color: data.productConditionColor },
            { label: 'Packaging Condition', val: data.packagingCondition, color: data.packagingConditionColor },
            { label: 'Packaged', val: data.packaged, color: data.packagedColor },
            { label: 'Accessories Available', val: data.accessoriesAvailable, color: data.accessoriesColor },
            { label: 'Barcode Verified', val: data.barcodeVerified, color: data.barcodeColor },
            { label: 'Expiry Checked', val: data.expiryChecked, color: data.expiryColor },
          ].map((item, idx) => (
            <div className="QualityInspection-grid-item" key={idx}>
              <span className="QualityInspection-label">{item.label}</span>
              <span className={`QualityInspection-badge badge-${item.color}`}>
                {item.val}
              </span>
            </div>
          ))}
        </div>

        {/* Photos Section */}
        <div className="QualityInspection-section">
          <span className="QualityInspection-label-main">Photos Captured</span>
          <div className="QualityInspection-photos">
            {data.photos?.length > 0 ? (
              <>
                {data.photos.map((src, idx) => (
                  <img key={idx} src={src} alt={`Capture ${idx + 1}`} className="QualityInspection-img" />
                ))}
                {data.extraPhotosCount > 0 && (
                  <div className="QualityInspection-more-photos">+{data.extraPhotosCount}</div>
                )}
              </>
            ) : (
              <span className="QualityInspection-empty-text">No photos available.</span>
            )}
          </div>
        </div>

        {/* Inspection Notes */}
        <div className="QualityInspection-section">
          <span className="QualityInspection-label-main">Inspection Notes</span>
          <div className="QualityInspection-notes-box">
            {data.inspectionNotes}
          </div>
        </div>

        {/* Action Button */}
        <div className="QualityInspection-actions">
           <button className="QualityInspection-submit-btn" onClick={() => { alert('Inspection marked as completed.'); navigate(-1); }}>
             Complete Inspection
           </button>
        </div>
      </div>
    </div>
  );
};

export default QualityInspection;