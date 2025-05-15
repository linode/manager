import { regionFactory } from '@linode/utilities';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { VPC } from './VPC';

import type { LinodeCreateFormValues } from '../utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

describe('VPC', () => {
  it('renders a heading', () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <VPC />,
    });

    const heading = getByText('VPC');

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('disables the VPC select if no region is selected', () => {
    const { getByLabelText } = renderWithThemeAndHookFormContext({
      component: <VPC />,
    });

    const vpcSelect = getByLabelText('Assign VPC');

    expect(vpcSelect).toBeVisible();
    expect(vpcSelect).toBeDisabled();
  });

  it('renders a warning if the selected region does not support VPC', async () => {
    const region = regionFactory.build({ capabilities: [] });

    server.use(
      http.get(`*/v4/regions/${region.id}`, () => {
        return HttpResponse.json(region);
      })
    );

    const { findByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <VPC />,
        useFormOptions: { defaultValues: { region: region.id } },
      });

    await findByText('VPC is not available in the selected region.', {
      exact: false,
    });
  });

  it('renders a subnet select if a VPC is selected', async () => {
    const { getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <VPC />,
        useFormOptions: {
          defaultValues: {
            interfaces: [{}, {}, {}],
            region: 'fake-region',
            vpc_id: 4,
          },
        },
      });

    expect(getByLabelText('Subnet')).toBeVisible();
  });

  it('renders VPC IPv4, NAT checkboxes, and IP Ranges inputs when a subnet is selected', async () => {
    const { getByLabelText, getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <VPC />,
        useFormOptions: {
          defaultValues: {
            interfaces: [{ subnet_id: 5 }, {}, {}],
            region: 'fake-region',
            vpc_id: 4,
          },
        },
      });

    expect(
      getByLabelText(
        'Auto-assign a VPC IPv4 address for this Linode in the VPC'
      )
    ).toBeInTheDocument();

    expect(
      getByLabelText('Assign a public IPv4 address for this Linode')
    ).toBeInTheDocument();

    expect(getByText('Assign additional IPv4 ranges')).toBeInTheDocument();
  });

  it('should check the VPC IPv4 if a "ipv4.vpc" is null/undefined', async () => {
    const { getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <VPC />,
        useFormOptions: {
          defaultValues: {
            interfaces: [{ ipv4: { vpc: undefined }, subnet_id: 5 }, {}, {}],
            region: 'fake-region',
            vpc_id: 4,
          },
        },
      });

    expect(
      getByLabelText(
        'Auto-assign a VPC IPv4 address for this Linode in the VPC'
      )
    ).toBeChecked();
  });

  it('should uncheck the VPC IPv4 if a "ipv4.vpc" is a string value and show the VPC IP TextField', async () => {
    const { getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <VPC />,
        useFormOptions: {
          defaultValues: {
            interfaces: [{ ipv4: { vpc: '' }, subnet_id: 5 }, {}, {}],
            region: 'fake-region',
            vpc_id: 4,
          },
        },
      });

    expect(
      getByLabelText(
        'Auto-assign a VPC IPv4 address for this Linode in the VPC'
      )
    ).not.toBeChecked();

    expect(getByLabelText('VPC IPv4 (required)')).toBeVisible();
  });
});
