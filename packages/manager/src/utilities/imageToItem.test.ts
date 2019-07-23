import imageToItem from './imageToItem';

const mockImages = ['linode/debian9', 'linode/arch'];

describe('imageToItem utility function', () => {
  it('should convert images to Item[]', () => {
    const items = imageToItem(mockImages);
    expect(items).toHaveLength(mockImages.length);
    expect(items[0]).toEqual({
      label: 'debian9',
      value: 'linode/debian9'
    });
  });

  it('should return an empty array if the initial list is empty', () => {
    expect(imageToItem([])).toEqual([]);
  });

  it('should leave non-linode image labels unchanged', () => {
    expect(imageToItem(['exampleuser/myprivateimage'])[0]).toEqual({
      label: 'exampleuser/myprivateimage',
      value: 'exampleuser/myprivateimage'
    });
  });
});
