import { regionFactory } from '@linode/utilities';
import React from 'react';

import { imageFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ViewImageDrawer } from './ViewImageDrawer';

import type { VIEW_SHARED_IMAGE_DETAILS_DRAWER_PENDO_IDS } from '../constants';

const mockRegions = regionFactory.buildList(2, {
  id: 'us-east',
  label: 'Newark, NJ',
  country: 'us',
});

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

beforeEach(() => {
  queryMocks.useRegionsQuery.mockReturnValue({ data: mockRegions });
});

const onClose = vi.fn();

const baseImage = imageFactory.build({
  capabilities: ['distributed-sites'],
  created: '2024-01-15T00:00:00',
  description: 'A test image description',
  id: 'private/123',
  image_sharing: {
    shared_by: {
      sharegroup_id: 1,
      sharegroup_label: 'my-share-group',
      sharegroup_uuid: 'abc-uuid',
      source_image_id: 123,
    },
    shared_with: null,
  },
  label: 'my-test-image',
  regions: [{ region: 'us-east', status: 'available' }],
  size: 1500,
  total_size: 3000,
});

const defaultProps = {
  image: baseImage,
  imageError: null,
  isFetching: false,
  onClose,
  open: true,
  pendoIDs: {} as typeof VIEW_SHARED_IMAGE_DETAILS_DRAWER_PENDO_IDS,
};

describe('ViewImageDrawer', () => {
  it('renders the drawer title', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('View shared image details')).toBeVisible();
  });

  it('renders image label', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('my-test-image')).toBeVisible();
  });

  it('renders the image ID', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('private/123')).toBeVisible();
  });

  it('renders the share group label', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('my-share-group')).toBeVisible();
  });

  it('renders original image size and total replica size', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText(/1500 MB/)).toBeVisible();
    expect(getByText(/3000 MB/)).toBeVisible();
  });

  it('renders created date', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('2024-01-15T00:00:00')).toBeVisible();
  });

  it('renders Encrypted when image has the distributed-sites capability', () => {
    const { getByTestId, queryByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByTestId('encrypted-indicator')).toBeVisible();
    expect(queryByText('Not Encrypted')).toBeNull();
  });

  it('renders Not Encrypted when image lacks the distributed-sites capability', () => {
    const image = imageFactory.build({
      ...baseImage,
      capabilities: [],
    });

    const { getByTestId, queryByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} image={image} />
    );

    expect(getByTestId('not-encrypted-indicator')).toBeVisible();
    expect(queryByText('Encrypted')).toBeNull();
  });

  it('renders the Cloud-Init metadata notice when image has the cloud-init capability', () => {
    const image = imageFactory.build({
      ...baseImage,
      capabilities: ['cloud-init'],
    });

    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} image={image} />
    );

    expect(getByText('Supports Metadata service via Cloud-Init')).toBeVisible();
  });

  it('does not render the Cloud-Init metadata notice when image lacks the cloud-init capability', () => {
    const { queryByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(queryByText('Supports Metadata service via Cloud-Init')).toBeNull();
  });

  it('renders the description when present', () => {
    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('A test image description')).toBeVisible();
  });

  it('does not render the description section when description is absent', () => {
    const image = imageFactory.build({ ...baseImage, description: null });

    const { queryByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} image={image} />
    );

    expect(queryByText('Description')).toBeNull();
  });

  it('renders the replicated region with flag and label', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
          label: 'Newark, NJ',
          country: 'us',
        }),
      ],
    });

    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('Newark, NJ')).toBeVisible();
  });

  it('renders Unknown for unrecognized region', () => {
    queryMocks.useRegionsQuery.mockReturnValue({ data: [] });

    const { getByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    expect(getByText('Unknown')).toBeVisible();
  });

  it('calls onClose when the Close button is clicked', async () => {
    const { getByTestId } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} />
    );

    getByTestId('cancel').click();

    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing in the drawer body when no image is provided', () => {
    const { queryByText } = renderWithTheme(
      <ViewImageDrawer {...defaultProps} image={undefined} />
    );

    expect(queryByText('my-test-image')).toBeNull();
    expect(queryByText('private/123')).toBeNull();
  });
});
