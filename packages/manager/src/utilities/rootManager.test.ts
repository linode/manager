import { createRoot } from 'react-dom/client';

import { handleRoot, rootInstances } from './rootManager';

vi.mock('react-dom/client', () => ({
  createRoot: vi.fn().mockImplementation((container) => ({
    _internalRoot: container, // Mock implementation detail
    render: vi.fn(),
  })),
}));

describe('handleRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    rootInstances.clear();
  });

  it('should create a new root for a new container', () => {
    const container = document.createElement('div');
    const root = handleRoot(container);

    expect(createRoot).toHaveBeenCalledWith(container);
    expect(rootInstances.get(container)).toBe(root);
    expect(createRoot).toHaveBeenCalledTimes(1);
  });

  it('should return the existing root for an existing container', () => {
    const container = document.createElement('div');
    // Call handleRoot twice with the same container
    const firstCallRoot = handleRoot(container);
    const secondCallRoot = handleRoot(container);

    // createRoot should only have been called once
    expect(createRoot).toHaveBeenCalledTimes(1);
    expect(firstCallRoot).toBe(secondCallRoot);
    expect(rootInstances.size).toBe(1);
  });
});
