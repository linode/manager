import { linodeFactory } from '@linode/utilities';
import { renderHook, waitFor } from '@testing-library/react';

import { eventFactory, imageFactory } from 'src/factories';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import {
  getEventsForImages,
  getImageLabelForLinode,
  getImagesSubTabIndex,
  getImageTypeToSubType,
  useIsPrivateImageSharingEnabled,
} from './utils';

import type { ImagesSubTab } from './utils';

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

describe('getImagesSubTabIndex', () => {
  const subTabs: ImagesSubTab[] = [
    { variant: 'custom', title: 'My custom images' },
    { variant: 'shared', title: 'Shared with me', isBeta: true },
    { variant: 'recovery', title: 'Recovery images' },
  ];

  it('returns 0 if selectedTab is undefined', () => {
    expect(getImagesSubTabIndex(subTabs, undefined)).toBe(0);
  });

  it('returns the correct index when selectedTab matches a tab key', () => {
    expect(getImagesSubTabIndex(subTabs, 'custom')).toBe(0);
    expect(getImagesSubTabIndex(subTabs, 'shared')).toBe(1);
    expect(getImagesSubTabIndex(subTabs, 'recovery')).toBe(2);
  });

  it('returns 0 if selectedTab does not exist in subTabs', () => {
    // @ts-expect-error intentionally passing an unexpected value
    expect(getImagesSubTabIndex(subTabs, 'hey')).toBe(0);
  });

  it('works with an empty subTabs array', () => {
    expect(getImagesSubTabIndex([], 'custom')).toBe(0);
  });
});

describe('getImageTypeToSubType', () => {
  it('returns "custom" when image type is "manual"', () => {
    expect(getImageTypeToSubType('manual')).toBe('custom');
  });

  it('returns "recovery" when image type is "automatic"', () => {
    expect(getImageTypeToSubType('automatic')).toBe('recovery');
  });

  it('returns "shared" when image type is "shared"', () => {
    expect(getImageTypeToSubType('shared')).toBe('shared');
  });
});
