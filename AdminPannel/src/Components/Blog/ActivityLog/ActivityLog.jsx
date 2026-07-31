import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ActivityLog.css';

const ActivityLog = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const passedData = location.state?.returnData;

  const timelineEvents = useMemo(() => {
    if (!passedData) return [];

    const steps = [
      { id: 'requested', title: 'Return Requested' },
      { id: 'review', title: 'Under Review' },
      { id: 'scheduled', title: 'Pickup Scheduled' },
      { id: 'picked', title: 'Product Picked' },
      { id: 'received', title: 'Warehouse Received' },
      { id: 'inspection', title: 'Inspection Completed' },
      { id: 'refund', title: passedData.type === 'Replacement' ? 'Replacement Processed' : 'Refund Completed' },
      { id: 'closed', title: 'Case Closed' }
    ];

    let currentIndex = 0;
    const status = passedData.status.toLowerCase();
    
    if (status === 'pickup scheduled') currentIndex = 2;
    else if (status === 'in inspection') currentIndex = 5;
    else if (status === 'refund processing') currentIndex = 6;
    else if (['refund processed', 'approved', 'rejected', 'closed'].includes(status)) currentIndex = 7;

    return steps.map((step, index) => {
      const isCompleted = index < currentIndex;
      const isActive = index === currentIndex;
      const isPending = index > currentIndex;

      // Mockup historical timestamps
      let timeStr = '-';
      let byStr = '';
      if (isCompleted || isActive) {
        if (index === 0) {
          timeStr = `${passedData.date}, ${passedData.time}`;
          byStr = `By ${passedData.customer.name}`;
        } else if (index === 1 || index === 2) {
          timeStr = `${passedData.date}, ${index === 1 ? '11:00 AM' : '01:15 PM'}`;
          byStr = `By ${passedData.assignedTo}`;
        } else {
          timeStr = `${passedData.date}, 04:30 PM`;
          byStr = 'By System';
        }
      }

      return {
        ...step,
        isCompleted,
        isActive,
        isPending,
        timeStr,
        byStr
      };
    });
  }, [passedData]);

  if (!passedData) {
    return (
      <div className="ActivityLog-container">
        <button type="button" className="ActivityLog-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
        <div className="ActivityLog-error-card">
          <h3>No Data Found</h3>
          <p>Please select a return record from the Return Management table first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ActivityLog-container">
      <div className="ActivityLog-header">
        <button type="button" className="ActivityLog-back-btn" onClick={() => navigate(-1)}>
          ← Back to Returns
        </button>
      </div>

      <div className="ActivityLog-section">
        <div className="ActivityLog-card">
          <div className="ActivityLog-card-header">
            <h3 className="ActivityLog-title">Timeline Activity</h3>
            <span className="ActivityLog-id-badge">{passedData.id}</span>
          </div>
          
          <div className="ActivityLog-timeline-wrapper">
            {timelineEvents.map((event) => (
              <div 
                key={event.id} 
                className={`ActivityLog-item ${event.isCompleted ? 'ActivityLog-completed' : ''} ${event.isActive ? 'ActivityLog-active' : ''} ${event.isPending ? 'ActivityLog-pending' : ''}`}
              >
                {/* Node Symbol */}
                <div className="ActivityLog-node">
                  {event.isCompleted ? (
                    <svg className="ActivityLog-check-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="ActivityLog-node-inner"></div>
                  )}
                </div>
                
                {/* Event Text Content */}
                <div className="ActivityLog-content">
                  <div className="ActivityLog-event-title">{event.title}</div>
                  
                  {!event.isPending ? (
                    <div className="ActivityLog-event-meta">
                      <span className="ActivityLog-event-time">{event.timeStr}</span>
                      <span className="ActivityLog-event-author">{event.byStr}</span>
                    </div>
                  ) : (
                    <div className="ActivityLog-event-empty">Awaiting update...</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;