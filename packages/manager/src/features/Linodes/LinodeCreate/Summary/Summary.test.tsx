import { regionFactory } from '@linode/utilities';
import React from 'react';

import { accountFactory, imageFactory, typeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Summary } from './Summary';

import type { LinodeCreateFormValues } from '../utilities';
import type { CreateLinodeRequest } from '@linode/api-v4';

describe('Linode Create Summary', () => {
  it('should render a heading based on the Linode label', async () => {
    const label = 'my-linode-1';
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { label } },
    });

    const heading = await findByText(`Summary ${label}`);

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render "Private IP" if private ip is enabled', async () => {
    const { getByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { private_ip: true } },
    });

    expect(getByText('Private IP')).toBeVisible();
  });

  it('should render "Backups" if backups are enabled and a type is selected', async () => {
    const type = typeFactory.build();

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: {
        defaultValues: { backups_enabled: true, type: type.id },
      },
    });

    await findByText('Backups');
  });

  it('should render an image label if an image is selected', async () => {
    const image = imageFactory.build();

    server.use(
      http.get('*/v4/images/*', () => {
        return HttpResponse.json(image);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { image: image.id } },
    });

    await findByText(image.label);
  });

  it('should render a region label if a region is selected', async () => {
    const region = regionFactory.build();

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: region.id } },
    });

    await findByText(`US, ${region.label}`);
  });

  it('should render a plan (type) label if a region and type are selected', async () => {
    const type = typeFactory.build();

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: {
        defaultValues: { region: 'fake-region', type: type.id },
      },
    });

    await findByText(type.label);
  });

  it('should a monthly price if a region and plan are selected', async () => {
    const type = typeFactory.build({ price: { monthly: 5 } });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: 'us-east', type: type.id } },
    });

    await findByText('$5/month');
  });

  it('should render a DC specific price if the selected region has price overrides', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      price: { monthly: 5 },
      region_prices: [{ id: regionId, monthly: 7 }],
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: regionId, type: type.id } },
    });

    await findByText('$7/month');
  });

  it('should render a backups price if backups are enabled, a type is selected, and a region is selected', async () => {
    const type = typeFactory.build({
      addons: {
        backups: { price: { monthly: 2 } },
      },
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: {
        defaultValues: {
          backups_enabled: true,
          region: 'us-east',
          type: type.id,
        },
      },
    });

    await findByText('$2/month');
  });

  it('should render a DC specific backups price if the region has overrides ', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      addons: {
        backups: {
          price: { monthly: 2 },
          region_prices: [{ id: regionId, monthly: 4.2 }],
        },
      },
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: {
        defaultValues: {
          backups_enabled: true,
          region: regionId,
          type: type.id,
        },
      },
    });

    await findByText('$4.20/month');
  });

  it('should render a summary item for an attached VLAN', async () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Summary />,
        useFormOptions: {
          defaultValues: {
            interfaces: [
              {},
              {
                label: 'my-vlan',
                purpose: 'vlan',
              },
            ],
          },
        },
      });

    expect(getByText('VLAN Attached')).toBeVisible();
  });

  it('should render "Encrypted" if disk encryption is enabled', async () => {
    const { getByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Summary />,
        useFormOptions: {
          defaultValues: { disk_encryption: 'enabled' },
        },
      });

    expect(getByText('Encrypted')).toBeVisible();
  });

  it('should render correct pricing for Marketplace app cluster deployments', async () => {
    const type = typeFactory.build({
      price: { hourly: 0.5, monthly: 2 },
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Summary />,
        useFormOptions: {
          defaultValues: {
            region: 'fake-region',
            stackscript_data: {
              cluster_size: 5,
            },
            type: type.id,
          },
        },
      });

    await findByText(`5 Nodes - $10/month $2.50/hr`);
  });

  it('should render "Encrypted" if a distributed region is selected', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });

    server.use(
      http.get('*/v4/regions', () => {
        return HttpResponse.json(makeResourcePage([region]));
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: region.id } },
    });

    await findByText('Encrypted');
  });

  describe('Legacy Interfaces', () => {
    it('should render "VPC Assigned" if a VPC is selected', () => {
      const { getByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: { interfaces: [{ subnet_id: 2 }], vpc_id: 1 },
          },
          options: { flags: { linodeInterfaces: { enabled: false } } },
        });

      expect(getByText('VPC Assigned')).toBeVisible();
    });

    it('should render "VLAN Attached" if a VLAN is selected', () => {
      const { getByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            // VLAN interface is always stored at index 1 for legacy interfaces
            defaultValues: { interfaces: [{}, { label: 'my-vlan-label' }] },
          },
          options: { flags: { linodeInterfaces: { enabled: false } } },
        });

      expect(getByText('VLAN Attached')).toBeVisible();
    });

    it('should render "Firewall Assigned" if a Firewall is selected', () => {
      const { getByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: { firewall_id: 5 },
          },
          options: { flags: { linodeInterfaces: { enabled: false } } },
        });

      expect(getByText('Firewall Assigned')).toBeVisible();
    });
  });

  describe('Linode Interfaces', () => {
    // Account capability must be present for Linode Interfaces
    beforeEach(() => {
      const account = accountFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces'],
      });

      server.use(
        http.get('*/v4/account', () => {
          return HttpResponse.json(account);
        })
      );
    });

    it('should render "VPC Assigned" if a VPC is selected', async () => {
      const { findByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: {
              linodeInterfaces: [{ purpose: 'vpc', vpc: { subnet_id: 2 } }],
            },
          },
          options: { flags: { linodeInterfaces: { enabled: true } } },
        });

      const text = await findByText('VPC Assigned');
      expect(text).toBeVisible();
    });

    it('should render "VLAN Attached" if a VLAN is selected', async () => {
      const { findByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: {
              linodeInterfaces: [
                { purpose: 'vlan', vlan: { vlan_label: 'my-test-vlan-1' } },
              ],
            },
          },
          options: { flags: { linodeInterfaces: { enabled: true } } },
        });

      const text = await findByText('VLAN Attached');
      expect(text).toBeVisible();
    });

    it('should render "Firewall Assigned" if a Firewall is selected', async () => {
      const { findByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: {
              linodeInterfaces: [{ firewall_id: 5 }],
              interface_generation: 'linode',
            },
          },
          options: { flags: { linodeInterfaces: { enabled: true } } },
        });

      const text = await findByText('Firewall Assigned');
      expect(text).toBeVisible();
    });
  });
});
