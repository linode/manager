import { AxiosRequestConfig } from 'axios';

import { API_ROOT } from 'src/constants';

import {
  createImage,
  deleteImage,
  getImage,
  getImages,
  updateImage
} from './images';

const mockFn = jest.fn((config: AxiosRequestConfig) =>
  Promise.resolve({ data: config })
);

jest.mock('axios', () => ({
  default: (config: AxiosRequestConfig) => mockFn(config)
}));

describe('images', () => {
  describe('GET', () => {
    it('should GET a single image when specifying ID', async () => {
      await getImage('100');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `${API_ROOT}/images/100`
      });
      mockFn.mockClear();
    });

    it('should GET multiple images', async () => {
      await getImages();
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `${API_ROOT}/images`
      });
      mockFn.mockClear();
    });

    it('should GET multiple images with pagination', async () => {
      const pagination = { page: 1, pageSize: 25 };
      await getImages(pagination);
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'GET',
        url: `${API_ROOT}/images`,
        params: {
          page: 1,
          pageSize: 25
        }
      });
      mockFn.mockClear();
    });
  });

  describe('POST', () => {
    it('should create an image with POST', async () => {
      await createImage(1234, 'test-image', 'my test-image');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `${API_ROOT}/images`,
        data: {
          disk_id: 1234,
          label: 'test-image',
          description: 'my test-image'
        }
      });
      mockFn.mockClear();
    });

    it('should be able to create an image without a label', async () => {
      await createImage(1234, undefined, 'my test-image');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `${API_ROOT}/images`,
        data: {
          disk_id: 1234,
          description: 'my test-image'
        }
      });
      mockFn.mockClear();
    });

    it('should be able to create an image without a description', async () => {
      await createImage(1234, 'my-image');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `${API_ROOT}/images`,
        data: {
          disk_id: 1234,
          label: 'my-image'
        }
      });
      mockFn.mockClear();
    });

    it('should be able to create an image without a label or description', async () => {
      await createImage(1234);
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'POST',
        url: `${API_ROOT}/images`,
        data: {
          disk_id: 1234
        }
      });
      mockFn.mockClear();
    });

    it('should fail when label does not match schema', async () => {
      try {
        await createImage(1234, 'my-image@');
      } catch (err) {
        expect(err).toBeDefined();
      }
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('PUT', () => {
    it('should update an image with PUT', async () => {
      await updateImage('private/1234', 'new-test-image', 'my new test-image');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'PUT',
        url: `${API_ROOT}/images/private/1234`,
        data: {
          label: 'new-test-image',
          description: 'my new test-image'
        }
      });
      mockFn.mockClear();
    });

    it('should be able to update an image without a description', async () => {
      await updateImage('private/1234', 'test-image');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'PUT',
        url: `${API_ROOT}/images/private/1234`,
        data: {
          label: 'test-image'
        }
      });
      mockFn.mockClear();
    });

    it('should be able to update without a label or description', async () => {
      await updateImage('private/1234');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'PUT',
        url: `${API_ROOT}/images/private/1234`,
        data: {}
      });
      mockFn.mockClear();
    });

    it('should fail when label does not match schema', async () => {
      try {
        await updateImage('private/1234', 'my-image@');
      } catch (err) {
        expect(err).toBeDefined();
      }
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('DELETE', () => {
    it('should DELETE an image', async () => {
      await deleteImage('private/1234');
      expect(mockFn).toHaveBeenLastCalledWith({
        method: 'DELETE',
        url: `${API_ROOT}/images/private/1234`
      });
    });
  });
});
