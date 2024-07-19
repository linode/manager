import type { MockContext } from './types';

type ObjectStore = 'mockContext' | 'seedContext';

const MOCK_CONTEXT: ObjectStore = 'mockContext';
const SEED_CONTEXT: ObjectStore = 'seedContext';

export const mswDB = {
  add: async <T extends keyof MockContext>(
    entity: T,
    payload: MockContext[T] extends Array<infer U> ? U : MockContext[T],
    state: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        mockContext[entity].push(payload);
        state[entity].push(payload as any); // casting to avoid inference issues

        const updatedRequest = store.put({ id: 1, ...mockContext });

        updatedRequest.onsuccess = () => {
          resolve();
        };
        updatedRequest.onerror = (event) => {
          reject(event);
        };
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  addMany: async <T extends keyof MockContext>(
    entity: T,
    payload: MockContext[T] extends Array<infer U> ? U[] : never,
    state?: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        mockContext[entity].push(...payload);
        if (state) {
          state[entity].push(...(payload as any));
        }

        const updatedRequest = store.put({ id: 1, ...mockContext });

        updatedRequest.onsuccess = () => {
          resolve();
        };
        updatedRequest.onerror = (event) => {
          reject(event);
        };
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  clear: async (objectStore: ObjectStore = MOCK_CONTEXT): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  delete: async <T extends keyof MockContext>(
    entity: T,
    id: number,
    state: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        const index = mockContext[entity].findIndex(
          (item: Record<string, unknown>) => item.id === id
        );
        if (index === -1) {
          reject();
          return;
        }

        mockContext[entity].splice(index, 1);
        state[entity].splice(index, 1);

        const updatedRequest = store.put({ id: 1, ...mockContext });

        updatedRequest.onsuccess = () => {
          resolve();
        };
        updatedRequest.onerror = (event) => {
          reject(event);
        };
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  deleteAll: async <T extends keyof MockContext>(
    entity: T,
    state: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        mockContext[entity] = [];
        state[entity] = [];

        const updatedRequest = store.put({ id: 1, ...mockContext });

        updatedRequest.onsuccess = () => {
          resolve();
        };
        updatedRequest.onerror = (event) => {
          reject(event);
        };
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  deleteMany: async <T extends keyof MockContext>(
    entity: T,
    ids: number[],
    state?: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext?.[entity]) {
          reject(new Error('Entity not found'));
          return;
        }

        ids.forEach((id) => {
          const index = mockContext[entity].findIndex(
            (item: Record<string, unknown>) => item.id === id
          );

          mockContext[entity].splice(index, 1);
          if (state) {
            state[entity].splice(index, 1);
          }
        });

        const updatedRequest = store.put({ id: 1, ...mockContext });

        updatedRequest.onsuccess = () => {
          resolve();
        };
        updatedRequest.onerror = (event) => {
          reject(event);
        };
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  get: async <T extends keyof MockContext>(
    entity: T,
    id: number,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<
    (MockContext[T] extends Array<infer U> ? U : MockContext[T]) | undefined
  > => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readonly');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        const entityData = mockContext[entity].find(
          (item: Record<string, unknown>) => item.id === id
        );

        resolve(entityData);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  getAll: async <T extends keyof MockContext>(
    entity: T,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<MockContext[T] | undefined> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readonly');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext) {
          reject();
          return;
        }

        if (!mockContext[entity]) {
          reject();
          return;
        }

        resolve(mockContext[entity]);
      };

      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  /**
   * Retrieves the whole mock context from IndexedDB.
   */
  getStore: async (
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<MockContext | undefined> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readonly');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  /**
   * Opens the IndexedDB with the given name and version.
   * Create the object store if it doesn't exist.
   */
  open: (name: string, version: number): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version);

      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(MOCK_CONTEXT)) {
          db.createObjectStore(MOCK_CONTEXT, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(SEED_CONTEXT)) {
          db.createObjectStore(SEED_CONTEXT, { keyPath: 'id' });
        }
      };
    });
  },

  /**
   * Saves the given mock context to IndexedDB.
   * Useful to replace or initialize the whole mock context.
   */
  saveStore: async (
    data: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      // eslint-disable-next-line xss/no-mixed-html
      const sanitizedData = JSON.parse(JSON.stringify(data));
      // eslint-disable-next-line xss/no-mixed-html
      const request = store.put({ id: 1, ...sanitizedData });

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  update: async <T extends keyof MockContext>(
    entity: T,
    id: number,
    payload: Partial<
      MockContext[T] extends Array<infer U> ? U : MockContext[T]
    >,
    state: MockContext,
    objectStore: ObjectStore = MOCK_CONTEXT
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;
        if (!mockContext || !mockContext[entity]) {
          reject(new Error('Entity not found'));
          return;
        }

        const index = mockContext[entity].findIndex(
          (item: { id: number }) => item.id === id
        );

        if (index === -1) {
          reject(new Error('Item not found'));
          return;
        }

        Object.assign(mockContext[entity][index], payload);
        Object.assign(state[entity][index], payload);

        const updatedRequest = store.put({ id: 1, ...mockContext });
        updatedRequest.onsuccess = () => resolve();
        updatedRequest.onerror = (event) => reject(event);
      };
    });
  },
};
