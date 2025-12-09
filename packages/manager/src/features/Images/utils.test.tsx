import { linodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { eventFactory, imageFactory } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getEventsForImages,
  getImageLabelForLinode,
  useIsPrivateImageSharingEnabled,
} from './utils';

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

describe('getEventsForImages', () => {
  it('sorts events by image', () => {
    imageFactory.resetSequenceNumber();
    const images = imageFactory.buildList(3);
    const successfulEvent = eventFactory.build({
      secondary_entity: { id: 1 },
    });
    const failedEvent = eventFactory.build({
      entity: { id: 2 },
      status: 'failed',
    });
    const unrelatedEvent = eventFactory.build();

    expect(
      getEventsForImages(images, [successfulEvent, failedEvent, unrelatedEvent])
    ).toEqual({
      ['private/1']: successfulEvent,
      ['private/2']: failedEvent,
    });
  });
});

describe('useIsPrivateImageSharingEnabled', () => {
  it('returns true if the feature is enabled', async () => {
    const options = { flags: { privateImageSharing: true } };

    const { result } = renderHook(() => useIsPrivateImageSharingEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isPrivateImageSharingEnabled).toBe(true);
    });
  });

  it('returns false if the feature is NOT enabled', async () => {
    const options = { flags: { privateImageSharing: false } };

    const { result } = renderHook(() => useIsPrivateImageSharingEnabled(), {
      wrapper: (ui) => wrapWithTheme(ui, options),
    });

    await waitFor(() => {
      expect(result.current.isPrivateImageSharingEnabled).toBe(false);
    });
  });
});
