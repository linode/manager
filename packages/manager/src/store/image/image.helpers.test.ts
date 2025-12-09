import { isLinodeKubeImageId } from './image.helpers';

describe('isLinodeKubeImageId', () => {
  it('should be false if the image id does not start with linode/', () => {
    expect(isLinodeKubeImageId('private/15943292')).toBe(false);
  });
  it('should be false if the image is a regular non-kube image', () => {
    expect(isLinodeKubeImageId('linode/alpine3.15')).toBe(false);
  });
  it('should be true if the image is a linode kube image', () => {
    expect(isLinodeKubeImageId('linode/ubuntu24.04-kube-v1.23.4')).toBe(true);
  });
});
