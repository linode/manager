import { linodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { eventFactory, imageFactory } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getEventsForImages,
  getImageLabelForLinode,
  getImageLibrarySubTabIndex,
  useIsPrivateImageSharingEnabled,
} from './utils';

import type { ImageLibrarySubTab } from './utils';

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

describe('getImageLibrarySubTabIndex', () => {
  const subTabs: ImageLibrarySubTab[] = [
    { type: 'owned-by-me', title: 'Owned by me' },
    { type: 'shared-with-me', title: 'Shared with me', isBeta: true },
    { type: 'recovery-images', title: 'Recovery images' },
  ];

  it('returns 0 if selectedTab is undefined', () => {
    expect(getImageLibrarySubTabIndex(subTabs, undefined)).toBe(0);
  });

  it('returns the correct index when selectedTab matches a tab key', () => {
    expect(getImageLibrarySubTabIndex(subTabs, 'owned-by-me')).toBe(0);
    expect(getImageLibrarySubTabIndex(subTabs, 'shared-with-me')).toBe(1);
    expect(getImageLibrarySubTabIndex(subTabs, 'recovery-images')).toBe(2);
  });

  it('returns 0 if selectedTab does not exist in subTabs', () => {
    // @ts-expect-error intentionally passing an unexpected value
    expect(getImageLibrarySubTabIndex(subTabs, 'hey')).toBe(0);
  });

  it('works with an empty subTabs array', () => {
    expect(getImageLibrarySubTabIndex([], 'owned-by-me')).toBe(0);
  });
});
