import { imageFactory, linodeFactory } from 'src/factories';

import { getImageLabelForLinode } from './utils';

describe('getImageLabelForLinode', () => {
  it('handles finding an image and getting the label', () => {
    const linode = linodeFactory.build({
      image: 'public/cool-image',
    });
    const images = imageFactory.buildList(1, {
      id: 'public/cool-image',
      label: 'Cool Image',
    });
    expect(getImageLabelForLinode(linode, images)).toBe('Cool Image');
  });
  it('falls back to the linodes image id if there is no match in the images array', () => {
    const linode = linodeFactory.build({
      image: 'public/cool-image',
    });
    const images = imageFactory.buildList(1, {
      id: 'public/not-cool-image',
      label: 'Not Cool Image',
    });
    expect(getImageLabelForLinode(linode, images)).toBe('public/cool-image');
  });
  it('returns null if the linode does not have an image', () => {
    const linode = linodeFactory.build({
      image: null,
    });
    const images = imageFactory.buildList(3);
    expect(getImageLabelForLinode(linode, images)).toBe(null);
  });
});
