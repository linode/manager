import { Domain } from '@linode/api-v4/lib/domains/types';
import { Linode } from '@linode/api-v4/lib/linodes/types';
import { NodeBalancer } from '@linode/api-v4/lib/nodebalancers/types';
import { Volume } from '@linode/api-v4/lib/volumes/types';
import { v4 } from 'uuid';

// Simple pub/sub class to keep track of mock data for the local dev tools. This allows subscription
// from the mock service worker, so the handlers can be updated whenever the mock data changes.
export type MockDataType = 'linode' | 'nodeBalancer' | 'domain' | 'volume';

export interface MockDataEntity<T> {
  mocked: boolean;
  quantity: number;
  template?: Partial<T>;
}

export interface MockData {
  linode?: MockDataEntity<Linode>;
  nodeBalancer?: MockDataEntity<NodeBalancer>;
  domain?: MockDataEntity<Domain>;
  volume?: MockDataEntity<Volume>;
}

export type SubscribeFunction = (mockData: MockData) => void;

export class MockDataController {
  subscribers: Record<string, SubscribeFunction>;
  mockData: MockData;

  constructor() {
    this.subscribers = {};
    this.mockData = {};
  }

  subscribe(fn: SubscribeFunction) {
    const id = v4();
    this.subscribers[id] = fn;
    return id;
  }

  unsubscribe(token: string) {
    delete this.subscribers[token];
  }

  updateMockData(newMockData: MockData) {
    this.mockData = { ...this.mockData, ...newMockData };
    this.notifySubscribers();
  }

  private notifySubscribers() {
    Object.values(this.subscribers).forEach((thisSubscriber) => {
      thisSubscriber(this.mockData);
    });
  }
}

export const mockDataController = new MockDataController();
