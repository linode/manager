import { images, privateImages } from 'src/__data__/images';
import { filterPublicImages, filterUDFErrors } from './stackscriptUtils';

describe('StackScript Error Utilties', () => {
  it('should filter out public Images', () => {
    const filteredImages = filterPublicImages([...images, ...privateImages]);
    expect(
      filteredImages.every(eachImage => !!eachImage.is_public)
    ).toBeTruthy();
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

    const nonUDFErrorKeys = ['label', 'ssh_keys'];

    const filteredErrors = filterUDFErrors(nonUDFErrorKeys, mockErrors);
    expect(filteredErrors[0].field).toBe('wp_password');
    expect(filteredErrors).toHaveLength(1);
  });
});
