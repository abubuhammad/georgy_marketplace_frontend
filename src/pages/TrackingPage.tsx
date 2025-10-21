import React from 'react';
import { useParams } from 'react-router-dom';
import { OrderTracking } from '@/features/delivery/OrderTracking';

const TrackingPage: React.FC = () => {
  const { trackingNumber } = useParams<{ trackingNumber?: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <OrderTracking trackingNumber={trackingNumber} />
    </div>
  );
};

export default TrackingPage;
