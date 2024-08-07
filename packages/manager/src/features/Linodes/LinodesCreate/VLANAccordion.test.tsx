import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { regionFactory } from 'src/factories';
import { queryClientFactory } from 'src/queries/base';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { VLANAccordion } from './VLANAccordion';

import type { VLANAccordionProps } from './VLANAccordion';

const queryClient = queryClientFactory();

const defaultProps: VLANAccordionProps = {
  handleVLANChange: vi.fn(),
  helperText: 'helper text',
  ipamAddress: '',
  vlanLabel: '',
};

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/regions/regions', async () => {
  const actual = await vi.importActual('src/queries/regions/regions');
  return {
    ...actual,
    useRegionsQuery: queryMocks.useRegionsQuery,
  };
});

describe('VLANAccordion Component', () => {
  it('renders collapsed VLANAccordion component', () => {
    const { getByRole } = renderWithTheme(<VLANAccordion {...defaultProps} />, {
      queryClient,
    });

    expect(getByRole('button', { name: 'VLAN' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  it('contains expected elements when expanded', () => {
    const {
      container,
      getByPlaceholderText,
      getByRole,
      getByTestId,
    } = renderWithTheme(<VLANAccordion {...defaultProps} />, {
      queryClient,
    });

    fireEvent.click(getByRole('button', { name: 'VLAN' }));

    expect(getByTestId('notice-warning')).toBeVisible();
    expect(
      getByRole('link', {
        name: 'Configuration Profile - link opens in a new tab',
      })
    ).toBeVisible();
    expect(getByPlaceholderText('Create or select a VLAN')).toBeVisible();
    expect(container.querySelector('#vlan-label-1')).toBeDisabled();
    expect(getByPlaceholderText('192.0.2.0/24')).toBeVisible();
    expect(container.querySelector('#ipam-input-1')).toBeDisabled();
  });

  it('enables the input fields when a region is selected', () => {
    queryMocks.useRegionsQuery.mockReturnValue({
      data: [
        regionFactory.build({
          capabilities: ['Vlans'],
          id: 'us-east',
        }),
      ],
    });

    const { container, getByRole } = renderWithTheme(
      <VLANAccordion {...defaultProps} region="us-east" />,
      {
        queryClient,
      }
    );

    fireEvent.click(getByRole('button', { name: 'VLAN' }));

    expect(container.querySelector('#vlan-label-1')).not.toHaveAttribute(
      'disabled'
    );
    expect(container.querySelector('#ipam-input-1')).not.toHaveAttribute(
      'disabled'
    );
  });

  it('contains a tooltip containing avalable VLAN regions', async () => {
    const { getAllByRole, getByRole, getByText } = renderWithTheme(
      <VLANAccordion {...defaultProps} />,
      {
        queryClient,
      }
    );

    fireEvent.click(getByRole('button', { name: 'VLAN' }));
    fireEvent.mouseOver(getByText('select regions'));

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeVisible();
      expect(getAllByRole('listitem').length).toBeGreaterThan(0);
    });
  });
});
