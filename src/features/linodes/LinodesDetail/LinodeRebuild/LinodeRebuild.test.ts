import { groupImages } from './LinodeRebuild';

const privateImage1 = {
  deprecated: false,
  type: 'manual',
  id: 'private/0001',
  created_by: 'somefella',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const privateImage2 = {
  deprecated: false,
  type: 'manual',
  id: 'private/0002',
  created_by: 'somefella',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const deprecatedImage1 = {
  deprecated: true,
  type: 'manual',
  id: 'linode/0001',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const deprecatedImage2 = {
  deprecated: true,
  type: 'manual',
  id: 'linode/0002',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const recommendedImage1 = {
  deprecated: false,
  type: 'manual',
  id: 'linode/0001',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const recommendedImage2 = {
  deprecated: false,
  type: 'manual',
  id: 'linode/0002',
  created_by: 'linode',

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const deletedImage1 = {
  deprecated: false,
  type: 'automatic',
  id: 'private/0001',
  created_by: null,

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

const deletedImage2 = {
  deprecated: false,
  type: 'automatic',
  id: 'private/0002',
  created_by: null,

  description: '',
  vendor: null,
  size: 0,
  label: '',
  is_public: false,
  created: '',
};

describe('LinodeRebuild', () => {
  describe('groupImages', () => {
    it('should return group images', () => {

      const result = groupImages([privateImage1, privateImage2]);

      const expected = {
        images: [privateImage1, privateImage2],
      };

      expect(result).toEqual(expected);
    });

    it('should return group deprecated images', () => {

      const result = groupImages([deprecatedImage1, deprecatedImage2]);

      const expected = {
        older: [deprecatedImage1, deprecatedImage2],
      };

      expect(result).toEqual(expected);
    });

    it('should return group recommended images', () => {
      const images = [recommendedImage1, recommendedImage2];
      const result = groupImages(images);

      const expected = {
        recommended: images,
      };

      expect(result).toEqual(expected);
    });

    it('should return group deleted images', () => {

      const result = groupImages([deletedImage1, deletedImage2]);

      const expected = {
        deleted: [deletedImage1, deletedImage2],
      };

      expect(result).toEqual(expected);
    });
  });
});
