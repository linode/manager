import { regionFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { objectStorageEndpointsFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { ScopeValueSelect } from './ScopeValueSelect';

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn().mockReturnValue({}),
  useIsGeckoEnabled: vi.fn().mockReturnValue({ isGeckoLAEnabled: true }),
  useRegionsQuery: vi.fn().mockReturnValue({}),
  useObjectStorageEndpoints: vi.fn().mockReturnValue({}),
}));

vi.mock('src/hooks/useFlags', () => ({
  useFlags: mocks.useFlags,
}));

vi.mock('@linode/shared', () => ({
  useIsGeckoEnabled: mocks.useIsGeckoEnabled,
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useRegionsQuery: mocks.useRegionsQuery,
  };
});

vi.mock('src/queries/object-storage/queries', () => ({
  useObjectStorageEndpoints: mocks.useObjectStorageEndpoints,
}));

describe('ScopeValueSelect', () => {
  it('renders region select and calls onChange with selected region', async () => {
    mocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          id: 'us-east',
          label: 'Newark, NJ',
          capabilities: ['Linodes'],
        }),
      ],
    });

    const onChange = vi.fn();

    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <ScopeValueSelect
        additionalProps={{ regionCapability: 'Linodes' }}
        onChange={onChange}
        scope={'region'}
      />
    );

    const regionSelect = getByPlaceholderText('Select a Region');
    await userEvent.click(regionSelect);

    await waitFor(async () => {
      const option = getByRole('option', { name: 'Newark, NJ (us-east)' });
      await userEvent.click(option);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('us-east');
    });
  });

  it('renders object storage endpoint select and calls onChange with selected endpoint', async () => {
    mocks.useObjectStorageEndpoints.mockReturnValue({
      data: [
        objectStorageEndpointsFactory.build({
          s3_endpoint: 'endpoint1',
          endpoint_type: 'E0',
        }),
      ],
    });

    const onChange = vi.fn();

    const { getByPlaceholderText, getByRole } = renderWithTheme(
      <ScopeValueSelect
        additionalProps={{}}
        onChange={onChange}
        scope={'obj-endpoint'}
      />
    );

    const select = getByPlaceholderText('Select an Object Storage endpoint');
    await userEvent.click(select);

    await waitFor(async () => {
      const option = getByRole('option', { name: 'endpoint1 (Standard E0)' });
      await userEvent.click(option);
    });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('endpoint1');
    });
  });
});
