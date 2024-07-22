import { handler } from '../src/index';
import { KinesisStreamEvent } from 'aws-lambda';
import axios from 'axios';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

vi.mock('axios');
// @ts-ignore
const mockedAxios = axios as vi.Mocked<typeof axios>;

beforeAll(() => {
  process.env.PUBLISH_URL = 'http://localhost:3000';
});

describe('handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should publish booking_completed events', async () => {
    const event: KinesisStreamEvent = {
      Records: [
        {
          kinesis: {
            data: Buffer.from(
              JSON.stringify({
                id: 'a4388131-1492-11ec-a0b2-c78ffbd69347',
                partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
                timestamp: 1631538059459,
                type: 'booking_completed',
                booking_completed: {
                  timestamp: 1631538059459,
                  product_provider: 'P&O Ferries',
                  orderId: 123456,
                },
              })
            ).toString('base64'),
            partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
            approximateArrivalTimestamp: 1631538059459,
            kinesisSchemaVersion: '1.0',
            sequenceNumber: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
          },
          eventSource: 'aws:kinesis',
          eventID:
            'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
          invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
          eventVersion: '1.0',
          eventName: 'aws:kinesis:record',
          eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
          awsRegion: 'us-east-1',
        },
      ],
    };

    mockedAxios.post.mockResolvedValue({ status: 200 });

    await handler(event);

    expect(mockedAxios.post).toHaveBeenCalledWith(process.env.PUBLISH_URL, {
      product_order_id_buyer: 123456,
      timestamp: new Date(1631538059459).toISOString(),
      product_provider_buyer: 'P&O Ferries',
    });
  });

  it('should not publish non-booking_completed events', async () => {
    const event: KinesisStreamEvent = {
      Records: [
        {
          kinesis: {
            data: Buffer.from(
              JSON.stringify({
                id: 'a4388131-1492-11ec-a0b2-c78ffbd69347',
                partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
                timestamp: 1631538059459,
                type: 'other_event',
              })
            ).toString('base64'),
            partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
            approximateArrivalTimestamp: 1631538059459,
            kinesisSchemaVersion: '1.0',
            sequenceNumber: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
          },
          eventSource: 'aws:kinesis',
          eventID:
            'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
          invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
          eventVersion: '1.0',
          eventName: 'aws:kinesis:record',
          eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
          awsRegion: 'us-east-1',
        },
      ],
    };

    await handler(event);

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it('should handle errors when publishing events', async () => {
    const event: KinesisStreamEvent = {
      Records: [
        {
          kinesis: {
            data: Buffer.from(
              JSON.stringify({
                id: 'a4388131-1492-11ec-a0b2-c78ffbd69347',
                partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
                timestamp: 1631538059459,
                type: 'booking_completed',
                booking_completed: {
                  timestamp: 1631538059459,
                  product_provider: 'P&O Ferries',
                  orderId: 123456,
                },
              })
            ).toString('base64'),
            partitionKey: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
            approximateArrivalTimestamp: 1631538059459,
            kinesisSchemaVersion: '1.0',
            sequenceNumber: 'c7724b06-813d-410a-adbc-7d19ebff04b2',
          },
          eventSource: 'aws:kinesis',
          eventID:
            'shardId-000000000000:49545115243490985018280067714973144582180062593244200961',
          invokeIdentityArn: 'arn:aws:iam::EXAMPLE',
          eventVersion: '1.0',
          eventName: 'aws:kinesis:record',
          eventSourceARN: 'arn:aws:kinesis:EXAMPLE',
          awsRegion: 'us-east-1',
        },
      ],
    };

    mockedAxios.post.mockRejectedValue(new Error('Network error'));

    await handler(event);

    expect(mockedAxios.post).toHaveBeenCalledWith(process.env.PUBLISH_URL, {
      product_order_id_buyer: 123456,
      timestamp: new Date(1631538059459).toISOString(),
      product_provider_buyer: 'P&O Ferries',
    });
  });
});
