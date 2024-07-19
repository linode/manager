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
    state: MockContext
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [MOCK_CONTEXT, SEED_CONTEXT],
        'readwrite'
      );
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = transaction.objectStore(SEED_CONTEXT);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockContext = storeRequest.result;

        seedRequest.onsuccess = () => {
          const seedContext = seedRequest.result;

          const deleteEntity = (context: MockContext | undefined) => {
            if (context && context[entity]) {
              const index = context[entity].findIndex((item) => {
                if (!hasId(item)) {
                  return false;
                }

                return item.id === id;
              });
              if (index !== -1) {
                context[entity].splice(index, 1);
              }
            }
          };

          deleteEntity(mockContext);
          deleteEntity(seedContext);

          if (state[entity]) {
            const stateIndex = state[entity].findIndex((item) => {
              if (!hasId(item)) {
                return false;
              }

              return item.id === id;
            });
            if (stateIndex !== -1) {
              state[entity].splice(stateIndex, 1);
            }
          }

          const updateStoreRequest = store.put({ id: 1, ...mockContext });
          const updateSeedRequest = seedStore.put({ id: 1, ...seedContext });

          Promise.all([
            new Promise<void>((resolve, reject) => {
              updateStoreRequest.onsuccess = () => resolve();
              updateStoreRequest.onerror = (event) => reject(event);
            }),
            new Promise<void>((resolve, reject) => {
              updateSeedRequest.onsuccess = () => resolve();
              updateSeedRequest.onerror = (event) => reject(event);
            }),
          ])
            .then(() => resolve())
            .catch((error) => reject(error));
        };

        seedRequest.onerror = (event) => reject(event);
      };

      storeRequest.onerror = (event) => reject(event);
    });
  },

  deleteAll: async <T extends keyof MockContext>(
    entity: T,
    state: MockContext,
    objectStore: ObjectStore
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
        if (state?.[entity]) {
          state[entity] = [];
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
      const transaction = db.transaction(
        [MOCK_CONTEXT, SEED_CONTEXT],
        'readonly'
      );
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = transaction.objectStore(SEED_CONTEXT);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockContext = storeRequest.result;
        seedRequest.onsuccess = () => {
          const seedContext = seedRequest.result;

          const findEntity = (context: MockContext | undefined) => {
            return context?.[entity]?.find((item) => {
              if (!hasId(item)) {
                return false;
              }
              return item.id === id;
            });
          };

          const mockEntity = findEntity(mockContext);
          const seedEntity = findEntity(seedContext);

          resolve(
            (mockEntity ?? seedEntity) as MockContext[T] extends Array<infer U>
              ? U
              : MockContext[T]
          );
        };
        seedRequest.onerror = (event) => {
          reject(event);
        };
      };
      storeRequest.onerror = (event) => {
        reject(event);
      };
    });
  },

  getAll: async <T extends keyof MockContext>(
    entity: T
  ): Promise<MockContext[T] | undefined> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [MOCK_CONTEXT, SEED_CONTEXT],
        'readonly'
      );
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = transaction.objectStore(SEED_CONTEXT);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockContext = storeRequest.result;
        seedRequest.onsuccess = () => {
          const seedContext = seedRequest.result;
          const mockEntities = mockContext?.[entity] || [];
          const seedEntities = seedContext?.[entity] || [];
          resolve([...mockEntities, ...seedEntities] as MockContext[T]);
        };
        seedRequest.onerror = (event) => {
          reject(event);
        };
      };
      storeRequest.onerror = (event) => {
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
    state: MockContext
  ): Promise<void> => {
    const db = await mswDB.open('MockContextDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        [MOCK_CONTEXT, SEED_CONTEXT],
        'readwrite'
      );
      const store = transaction.objectStore(MOCK_CONTEXT);
      const seedStore = transaction.objectStore(SEED_CONTEXT);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockContext = storeRequest.result;
        if (mockContext && mockContext[entity]) {
          const index = mockContext[entity].findIndex(
            (item: { id: number }) => item.id === id
          );
          if (index !== -1) {
            Object.assign(mockContext[entity][index], payload);
            Object.assign(state[entity][index], payload);

            const updatedRequest = store.put({ id: 1, ...mockContext });
            updatedRequest.onsuccess = () => resolve();
            updatedRequest.onerror = (event) => reject(event);
            return;
          }
        }

        seedRequest.onsuccess = () => {
          const seedContext = seedRequest.result;
          if (!seedContext || !seedContext[entity]) {
            reject(new Error('Entity not found'));
            return;
          }

          const index = seedContext[entity].findIndex(
            (item: { id: number }) => item.id === id
          );
          if (index === -1) {
            reject(new Error('Item not found'));
            return;
          }

          Object.assign(seedContext[entity][index], payload);
          Object.assign(state[entity][index], payload);

          const updatedSeedRequest = seedStore.put({ id: 1, ...seedContext });
          updatedSeedRequest.onsuccess = () => resolve();
          updatedSeedRequest.onerror = (event) => reject(event);
        };

        seedRequest.onerror = (event) => reject(event);
      };

      storeRequest.onerror = (event) => reject(event);
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
