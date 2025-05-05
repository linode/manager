import { hasId } from './presets/crud/seeds/utils';

import type { MockState } from './types';

type ObjectStore = 'mockState' | 'seedState';

const MOCK_STATE: ObjectStore = 'mockState';
const SEED_STATE: ObjectStore = 'seedState';

// Helper method to find an item in the DB. Returns true
// if the given item has the same ID as the given number
const findItem = (item: unknown, id: number) => {
  // Some items may be stored as [number, Entity], so we
  // need to check for both Entity and [number, Entity] types
  const isItemTuple = Array.isArray(item) && item.length >= 2;

  const itemTupleToFind = isItemTuple && hasId(item[1]) && item[1].id === id;

  const itemToFind = hasId(item) && item.id === id;

  return itemTupleToFind || itemToFind;
};

export const mswDB = {
  add: async <T extends keyof MockState>(
    entity: T,
    payload: MockState[T] extends Array<infer U> ? U : MockState[T],
    state: MockState
  ): Promise<MockState[T] extends Array<infer U> ? U : MockState[T]> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_STATE], 'readwrite');
      const store = transaction.objectStore(MOCK_STATE);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockState = request.result;

        if (!mockState?.[entity]) {
          reject();

          return;
        }

        // Generate unique ID if necessary
        if (hasId(payload)) {
          let newId = payload.id;

          while (
            mockState[entity].some(
              // eslint-disable-next-line no-loop-func
              (item: { id: number }) => item.id === newId
            )
          ) {
            newId = newId + 1;
          }
          payload.id = newId;
        } else if (
          // generate unique ID for tuple type entities if necessary
          Array.isArray(payload) &&
          payload.length >= 2 &&
          hasId(payload[1])
        ) {
          let newId = payload[1].id;
          while (
            mockState[entity].some(
              // eslint-disable-next-line no-loop-func
              (item: [number, { id: number }]) => item[1].id === newId
            )
          ) {
            newId = newId + 1;
          }
          payload[1].id = newId;
        }

        mockState[entity].push(payload);
        state[entity].push(payload as any);

        const updatedRequest = store.put({ id: 1, ...mockState });

        updatedRequest.onsuccess = () => {
          resolve(payload);
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

  addMany: async <T extends keyof MockState>(
    entity: T,
    payload: MockState[T] extends Array<infer U> ? U[] : never,
    state?: MockState,
    objectStore: ObjectStore = MOCK_STATE
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockState = request.result;
        if (!mockState?.entity) {
          reject();

          return;
        }

        // Generate unique ID if necessary
        payload.forEach((item) => {
          if (!hasId(item)) {
            return;
          }
          let newId = item.id;

          while (
            mockState[entity].some(
              // eslint-disable-next-line no-loop-func
              (item: { id: number }) => item.id === newId
            )
          ) {
            newId = newId + 1;
          }
          item.id = newId;
        });

        mockState[entity].push(...payload);
        if (state) {
          state[entity].push(...(payload as any));
        }

        const updatedRequest = store.put({ id: 1, ...mockState });

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

  clear: async (objectStore: ObjectStore = MOCK_STATE): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

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

  delete: async <T extends keyof MockState>(
    entity: T,
    id: number,
    state: MockState
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_STATE, SEED_STATE], 'readwrite');
      const store = transaction.objectStore(MOCK_STATE);
      const seedStore = transaction.objectStore(SEED_STATE);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockState = storeRequest.result;

        seedRequest.onsuccess = () => {
          const seedState = seedRequest.result;

          const deleteEntity = (state: MockState | undefined) => {
            if (state && state[entity]) {
              const index = state[entity].findIndex((item) =>
                findItem(item, id)
              );
              if (index !== -1) {
                state[entity].splice(index, 1);
              }
            }
          };

          deleteEntity(mockState);
          deleteEntity(seedState);

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

          const updateStoreRequest = store.put({ id: 1, ...mockState });
          const updateSeedRequest = seedStore.put({ id: 1, ...seedState });

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

  deleteAll: async <T extends keyof MockState>(
    entity: T,
    state: MockState,
    objectStore: ObjectStore
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockState = request.result;
        if (!mockState) {
          reject();
          return;
        }

        if (!mockState[entity]) {
          reject();
          return;
        }

        mockState[entity] = [];
        if (state?.[entity]) {
          state[entity] = [];
        }

        const updatedRequest = store.put({ id: 1, ...mockState });

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

  deleteMany: async <T extends keyof MockState>(
    entity: T,
    ids: number[],
    state?: MockState,
    objectStore: ObjectStore = MOCK_STATE
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);
      const request = store.get(1);

      request.onsuccess = () => {
        const mockState = request.result;
        if (!mockState?.[entity]) {
          reject(new Error('Entity not found'));
          return;
        }

        ids.forEach((id) => {
          const index = mockState[entity].findIndex(
            (item: Record<string, unknown>) => item.id === id
          );

          mockState[entity].splice(index, 1);
          if (state) {
            state[entity].splice(index, 1);
          }
        });

        const updatedRequest = store.put({ id: 1, ...mockState });

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

  get: async <T extends keyof MockState>(
    entity: T,
    id: number
  ): Promise<
    (MockState[T] extends Array<infer U> ? U : MockState[T]) | undefined
  > => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_STATE, SEED_STATE], 'readonly');
      const store = transaction.objectStore(MOCK_STATE);
      const seedStore = transaction.objectStore(SEED_STATE);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockState = storeRequest.result;
        seedRequest.onsuccess = () => {
          const seedState = seedRequest.result;

          const findEntity = (state: MockState | undefined) => {
            return state?.[entity]?.find((item) => findItem(item, id));
          };

          const mockEntity = findEntity(mockState);
          const seedEntity = findEntity(seedState);

          resolve(
            (mockEntity ?? seedEntity) as MockState[T] extends Array<infer U>
              ? U
              : MockState[T]
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

  getAll: async <T extends keyof MockState>(
    entity: T
  ): Promise<MockState[T] | undefined> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_STATE, SEED_STATE], 'readonly');
      const store = transaction.objectStore(MOCK_STATE);
      const seedStore = transaction.objectStore(SEED_STATE);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockState = storeRequest.result;
        seedRequest.onsuccess = () => {
          const seedState = seedRequest.result;
          const mockEntities = mockState?.[entity] || [];
          const seedEntities = seedState?.[entity] || [];

          resolve([...mockEntities, ...seedEntities] as MockState[T]);
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
   * Retrieves the whole mock state from IndexedDB.
   */
  getStore: async (
    objectStore: ObjectStore = MOCK_STATE
  ): Promise<MockState | undefined> => {
    const db = await mswDB.open('MockDB', 1);

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

        if (!db.objectStoreNames.contains(MOCK_STATE)) {
          db.createObjectStore(MOCK_STATE, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(SEED_STATE)) {
          db.createObjectStore(SEED_STATE, { keyPath: 'id' });
        }
      };
    });
  },

  /**
   * Saves the given mock state to IndexedDB.
   * Useful to replace or initialize the whole mock state.
   */
  saveStore: async (
    data: MockState,
    objectStore: ObjectStore = MOCK_STATE
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([objectStore], 'readwrite');
      const store = transaction.objectStore(objectStore);

      const sanitizedData = JSON.parse(JSON.stringify(data));

      const request = store.put({ id: 1, ...sanitizedData });

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = (event) => {
        reject(event);
      };
    });
  },

  update: async <T extends keyof MockState>(
    entity: T,
    id: number,
    payload: Partial<MockState[T] extends Array<infer U> ? U : MockState[T]>,
    state: MockState
  ): Promise<void> => {
    const db = await mswDB.open('MockDB', 1);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([MOCK_STATE, SEED_STATE], 'readwrite');
      const store = transaction.objectStore(MOCK_STATE);
      const seedStore = transaction.objectStore(SEED_STATE);

      const storeRequest = store.get(1);
      const seedRequest = seedStore.get(1);

      storeRequest.onsuccess = () => {
        const mockState = storeRequest.result;
        if (mockState && mockState[entity]) {
          const index = mockState[entity].findIndex(
            (item: [number, { id: number }] | { id: number }) =>
              findItem(item, id)
          );

          if (index !== -1) {
            Object.assign(mockState[entity][index], payload);
            Object.assign(state[entity][index], payload);

            const updatedRequest = store.put({ id: 1, ...mockState });
            updatedRequest.onsuccess = () => resolve();
            updatedRequest.onerror = (event) => reject(event);
            return;
          }
        }

        seedRequest.onsuccess = () => {
          const seedState = seedRequest.result;
          if (!seedState || !seedState[entity]) {
            reject(new Error('Entity not found'));
            return;
          }

          const index = seedState[entity].findIndex(
            (item: [number, { id: number }] | { id: number }) =>
              findItem(item, id)
          );

          if (index === -1) {
            reject(new Error('Item not found'));
            return;
          }

          Object.assign(seedState[entity][index], payload);
          Object.assign(state[entity][index], payload);

          const updatedSeedRequest = seedStore.put({ id: 1, ...seedState });
          updatedSeedRequest.onsuccess = () => resolve();
          updatedSeedRequest.onerror = (event) => reject(event);
        };

        seedRequest.onerror = (event) => reject(event);
      };

      storeRequest.onerror = (event) => reject(event);
    });
  },
};
