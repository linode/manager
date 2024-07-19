import type { MockContext } from './types';

type ObjectStore = 'mockContext' | 'seedContext';

const MOCK_CONTEXT: ObjectStore = 'mockContext';
const SEED_CONTEXT: ObjectStore = 'seedContext';

export const mswDB = {
  add: async <T extends keyof MockContext>(
    entity: T,
    payload: MockContext[T] extends Array<infer U> ? U : MockContext[T],
    state: MockContext
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_CONTEXT], 'readwrite');
      const store = transaction.objectStore(MOCK_CONTEXT);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockContext = request.result;

        if (!mockContext?.[entity]) {
          reject();
          return;
        }

        mockContext[entity].push(payload);
        state[entity].push(payload as any);

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
    id: number
  ): Promise<
    (MockContext[T] extends Array<infer U> ? U : MockContext[T]) | undefined
  > => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_CONTEXT], 'readonly');
      const seedTransaction = db.transaction([SEED_CONTEXT], 'readonly');
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = seedTransaction.objectStore(SEED_CONTEXT);

      const request = store.get(1);
      const seedRequest = seedStore.get(1);

      Promise.all([
        new Promise<MockContext | undefined>((resolve, reject) => {
          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = (event) => {
            reject(event);
          };
        }),
        new Promise<MockContext | undefined>((resolve, reject) => {
          seedRequest.onsuccess = () => {
            resolve(seedRequest.result);
          };
          seedRequest.onerror = (event) => {
            reject(event);
          };
        }),
      ])
        .then(([mockContext, seedContext]) => {
          const mockEntity = mockContext?.[entity]?.find((item) => {
            if (!hasId(item)) {
              return false;
            }

            return item.id === id;
          });
          const seedEntity = seedContext?.[entity]?.find((item) => {
            if (!hasId(item)) {
              return false;
            }

            return item.id === id;
          });

          resolve(
            (mockEntity ?? seedEntity) as MockContext[T] extends Array<infer U>
              ? U
              : MockContext[T]
          );
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  getAll: async <T extends keyof MockContext>(
    entity: T
  ): Promise<MockContext[T] | undefined> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_CONTEXT], 'readonly');
      const seedTransaction = db.transaction([SEED_CONTEXT], 'readonly');
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = seedTransaction.objectStore(SEED_CONTEXT);

      const request = store.get(1);
      const seedRequest = seedStore.get(1);

      Promise.all([
        new Promise<MockContext | undefined>((resolve, reject) => {
          request.onsuccess = () => {
            resolve(request.result);
          };
          request.onerror = (event) => {
            reject(event);
          };
        }),
        new Promise<MockContext | undefined>((resolve, reject) => {
          seedRequest.onsuccess = () => {
            resolve(seedRequest.result);
          };
          seedRequest.onerror = (event) => {
            reject(event);
          };
        }),
      ])
        .then(([mockContext, seedContext]) => {
          const mockEntities = mockContext?.[entity] || [];
          const seedEntities = seedContext?.[entity] || [];

          resolve([...mockEntities, ...seedEntities] as MockContext[T]);
        })
        .catch((error) => {
          reject(error);
        });
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

type WithId = {
  id: unknown;
};

// Type guard to check if an object has an 'id' property
const hasId = (obj: any): obj is WithId => {
  return 'id' in obj;
};
