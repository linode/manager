import { waitFor } from '@testing-library/react';
import * as React from 'react';

import { InterfacePurpose } from '@linode/api-v4';
import { InterfaceSelect } from './InterfaceSelect';

import { queryClientFactory } from 'src/queries/base';
import { mockMatchMedia, renderWithTheme } from 'src/utilities/testHelpers';

const queryClient = queryClientFactory();

beforeAll(() => mockMatchMedia());
afterEach(() => {
  queryClient.clear();
});

const unavailableInRegionTextTestId = 'unavailable-in-region-text';

describe('InterfaceSelect', () => {
  const props = {
    fromAddonsPanel: false,
    handleChange: jest.fn(),
    ipamAddress: null,
    label: null,
    readOnly: false,
    region: 'us-east',
    slotNumber: 0,
    regionHasVLANs: true,
    errors: {},
  };

  it('should display helper text regarding VPCs not being available in the region in the Linode Add/Edit Config dialog if applicable', async () => {
    const _props = {
      ...props,
      purpose: 'vpc' as InterfacePurpose,
      regionHasVPCs: false,
    };

    const { queryByTestId } = renderWithTheme(<InterfaceSelect {..._props} />, {
      flags: { vpc: true },
    });

    await waitFor(() => {
      expect(queryByTestId(unavailableInRegionTextTestId)).toBeInTheDocument();
    });
  });

  it('should display helper text regarding VLANs not being available in the region in the Linode Add/Edit Config dialog if applicable', async () => {
    const _props = {
      ...props,
      purpose: 'vlan' as InterfacePurpose,
      regionHasVLANs: false,
    };

    const { queryByTestId } = renderWithTheme(<InterfaceSelect {..._props} />, {
      flags: { vpc: false },
    });

    await waitFor(() => {
      expect(queryByTestId(unavailableInRegionTextTestId)).toBeInTheDocument();
    });
  });
});
