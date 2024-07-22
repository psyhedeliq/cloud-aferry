// Interface for the booking completed event
export interface BookingCompletedEvent {
  id: string;
  partitionKey: string;
  timestamp: number;
  type: string;
  booking_completed: {
    timestamp: number;
    product_provider: string;
    orderId: number;
  };
}

// Interface for the transformed event
export interface TransformedEvent {
  product_order_id_buyer: number;
  timestamp: string;
  product_provider_buyer: string;
}
