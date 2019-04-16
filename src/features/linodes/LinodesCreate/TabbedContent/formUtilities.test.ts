import { images, privateImages } from 'src/__data__/images';
import { filterPublicImages, filterUDFErrors } from './formUtilities';

describe('Linode Create Utilities', () => {
  it('should filter out private Images', () => {
    const filteredImages = filterPublicImages([...images, ...privateImages]);
    expect(
      filteredImages.every(eachImage => !!eachImage.is_public)
    ).toBeTruthy();
  });

  it('should return a list of public images unchanged', () => {
    expect(filterPublicImages(images)).toEqual(images);
  });

  it('should handle abnormal inputs', () => {
    expect(filterPublicImages([])).toEqual([]);
    expect(filterPublicImages(privateImages)).toEqual([]);
  });

  it('should filter out all errors except UDF errors', () => {
    const mockErrors: Linode.ApiFieldError[] = [
      {
        field: 'label',
        reason: 'label is required'
      },
      {
        field: 'ssh_keys',
        reason: 'ssh_keys are required'
      },
      {
        field: 'wp_password',
        reason: 'a value for the UDF is required'
      }
    ];

    const errorResources = {
      label: 'A label',
      ssh_keys: 'ssh_keys'
    };

    const filteredErrors = filterUDFErrors(errorResources, mockErrors);
    expect(filteredErrors[0].field).toBe('wp_password');
    expect(filteredErrors).toHaveLength(1);
  });
});
