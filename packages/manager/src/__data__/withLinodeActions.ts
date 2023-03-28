import { vi } from 'vitest';

export default {
  linodeActions: {
    createLinode: vi.fn(),
    updateLinode: vi.fn(),
    deleteLinode: vi.fn(),
    rebootLinode: vi.fn(),
  },
};
