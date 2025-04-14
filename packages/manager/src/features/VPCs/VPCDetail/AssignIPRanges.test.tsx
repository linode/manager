import * as React from 'react';

import { ASSIGN_IPV4_RANGES_TITLE } from 'src/features/VPCs/constants';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignIPRanges } from './AssignIPRanges';

import type { ExtendedIP } from 'src/utilities/ipUtils';

describe('AssignIPRanges', () => {
  const handleIPRangeChangeMock = vi.fn();
  const ipRanges: ExtendedIP[] = [];
  const ipRangesError = 'Error message';

  afterEach(() => {
    handleIPRangeChangeMock.mockClear();
  });

  it('renders component with title and description', () => {
    const { getByText } = renderWithTheme(
      <AssignIPRanges
        handleIPRangeChange={handleIPRangeChangeMock}
        ipRanges={ipRanges}
      />
    );
    expect(getByText(ASSIGN_IPV4_RANGES_TITLE)).toBeInTheDocument();
    expect(
      getByText(
        'Assign additional IPv4 address ranges that the VPC can use to reach services running on this Linode.',
        { exact: false }
      )
    ).toBeInTheDocument();
  });

  it('renders error notice if ipRangesError is provided', () => {
    const { getByText } = renderWithTheme(
      <AssignIPRanges
        handleIPRangeChange={handleIPRangeChangeMock}
        ipRanges={ipRanges}
        ipRangesError={ipRangesError}
      />
    );
    expect(getByText('Error message')).toBeInTheDocument();
  });

  it('calls handleIPRangeChange when input value changes', async () => {
    const { getByText } = renderWithTheme(
      <AssignIPRanges
        handleIPRangeChange={handleIPRangeChangeMock}
        ipRanges={ipRanges}
      />
    );

    const button = getByText('Add IPv4 Range');
    expect(button).toBeInTheDocument();
  });
});
