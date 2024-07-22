import { KinesisStreamEvent } from 'aws-lambda';
import axios from 'axios';
import { BookingCompletedEvent, TransformedEvent } from './types';
import { EventEmitter } from 'events';

const PUBLISH_URL = process.env.PUBLISH_URL || 'http://localhost:3000';
const eventEmitter = new EventEmitter();

export const handler = async (event: KinesisStreamEvent) => {
  if (!PUBLISH_URL) {
    throw new Error('PUBLISH_URL environment variable is not defined');
  }

  const records = event.Records;

  for (const record of records) {
    const decodedData = Buffer.from(record.kinesis.data, 'base64').toString(
      'utf-8'
    );
    const parsedEvent: BookingCompletedEvent = JSON.parse(decodedData);

    if (parsedEvent.type === 'booking_completed') {
      const transformedEvent: TransformedEvent = {
        product_order_id_buyer: parsedEvent.booking_completed.orderId,
        timestamp: new Date(
          parsedEvent.booking_completed.timestamp
        ).toISOString(),
        product_provider_buyer: parsedEvent.booking_completed.product_provider,
      };

      eventEmitter.emit('booking_completed', transformedEvent);
    }
  }
};

eventEmitter.on(
  'booking_completed',
  async (transformedEvent: TransformedEvent) => {
    try {
      const response = await axios.post(PUBLISH_URL, transformedEvent);
      console.log(`Event published successfully: ${response.status}`);
    } catch (error: any) {
      console.error(`Failed to publish event: ${error.message}`, {
        error,
        transformedEvent,
      });
    }
  }
);
