import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './InventoryAdjustment.css';

const InventoryAdjustment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedData = location.state?.returnData;

  if (!passedData) {
    return (
      <div className="InventoryAdjustment-container">
        <button type="button" className="InventoryAdjustment-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
        <div className="InventoryAdjustment-error-card">
          <h3>No Data Found</h3>
          <p>Please select a return record from the Return Management table first.</p>
        </div>
      </div>
    );
  }

  // Derive dynamic values
  const isDamaged = passedData.reason?.toLowerCase().includes('damaged');
  const isWriteOff = isDamaged || passedData.reason?.toLowerCase().includes('poor');
  
  const adjustmentData = {
    type: isWriteOff ? 'Write-off / Dispose' : 'Restock',
    typeClass: isWriteOff ? 'writeoff' : 'restock',
    warehouse: 'Delhi Main Warehouse', 
    rackNumber: isWriteOff ? 'D-09-99 (Damage Bin)' : 'A-12-03',
    quantity: passedData.qty || 0,
    remarks: passedData.inspectionDetails?.notes || (isWriteOff ? 'Disposed due to severe product damage.' : 'Inspected and approved for restock.')
  };

  return (
    <div className="InventoryAdjustment-container">
      <div className="InventoryAdjustment-header">
        <button type="button" className="InventoryAdjustment-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="InventoryAdjustment-section">
        <div className="InventoryAdjustment-card-header">
          <h3 className="InventoryAdjustment-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Inventory Adjustment
          </h3>
          <span className="InventoryAdjustment-id-badge">{passedData.id}</span>
        </div>
        
        <div className="InventoryAdjustment-card">
          {/* Context Banner */}
          <div className="InventoryAdjustment-context">
            <strong>Product:</strong> {passedData.product?.name || 'Unknown Product'} 
            <span className="InventoryAdjustment-sku">({passedData.product?.sku || 'N/A'})</span>
          </div>

          <div className="InventoryAdjustment-list">
            <div className="InventoryAdjustment-row">
              <div className="InventoryAdjustment-label">Adjustment Action</div>
              <div className="InventoryAdjustment-value">
                <span className={`InventoryAdjustment-status-badge InventoryAdjustment-status-${adjustmentData.typeClass}`}>
                  {adjustmentData.type}
                </span>
              </div>
            </div>

            <div className="InventoryAdjustment-row">
              <div className="InventoryAdjustment-label">Target Warehouse</div>
              <div className="InventoryAdjustment-value">{adjustmentData.warehouse}</div>
            </div>

            <div className="InventoryAdjustment-row">
              <div className="InventoryAdjustment-label">Assigned Rack / Bin</div>
              <div className="InventoryAdjustment-value">{adjustmentData.rackNumber}</div>
            </div>

            <div className="InventoryAdjustment-row InventoryAdjustment-highlight-row">
              <div className="InventoryAdjustment-label">Quantity to Adjust</div>
              <div className="InventoryAdjustment-value InventoryAdjustment-qty">
                {adjustmentData.typeClass === 'restock' ? '+' : '-'}{adjustmentData.quantity} Units
              </div>
            </div>

            <div className="InventoryAdjustment-row">
              <div className="InventoryAdjustment-label">System Remarks</div>
              <div className="InventoryAdjustment-value InventoryAdjustment-remarks">
                "{adjustmentData.remarks}"
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="InventoryAdjustment-actions">
           <button className="InventoryAdjustment-submit-btn" onClick={() => alert('Inventory successfully adjusted!')}>
             Confirm Adjustment
           </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryAdjustment;