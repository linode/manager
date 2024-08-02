import { imageToImageOptions } from './utils';

const mockImages = ['linode/debian9', 'linode/arch'];

describe('imageToItem utility function', () => {
  it('should convert images to Item[]', () => {
    const items = imageToImageOptions(mockImages);
    expect(items).toHaveLength(mockImages.length);
    expect(items[0]).toEqual({
      label: 'debian9',
      value: 'linode/debian9',
    });
  });

  it('should return an empty array if the initial list is empty', () => {
    expect(imageToImageOptions([])).toEqual([]);
  });

  it('should leave non-linode image labels unchanged', () => {
    expect(imageToImageOptions(['exampleuser/myprivateimage'])[0]).toEqual({
      label: 'exampleuser/myprivateimage',
      value: 'exampleuser/myprivateimage',
    });
  });
});
