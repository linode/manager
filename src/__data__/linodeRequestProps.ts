export default {
  createLinode: jest.fn(() => Promise.resolve()),
  updateLinode: jest.fn(() => Promise.resolve()),
  deleteLinode: jest.fn(() => Promise.resolve()),
  getLinodes: jest.fn(() => Promise.resolve()),
  getLinode: jest.fn(() => Promise.resolve()),
  cloneLinode: jest.fn(() => Promise.resolve()),
  getAllLinodes: jest.fn(() => Promise.resolve()),
};
