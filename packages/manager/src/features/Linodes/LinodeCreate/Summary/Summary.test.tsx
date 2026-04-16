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
      http.get('*/v4*/regions', () => {
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

  it('should render a monthly price if a region and plan are selected', async () => {
    const type = typeFactory.build({ price: { hourly: 0.007, monthly: 5 } });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: 'us-east', type: type.id } },
      options: {
        flags: { computePricing: { banner: '', billing: 'monthly' } },
      },
    });

    await findByText('$5.00/month');
  });

  it('should render an hourly price if a region and plan are selected with hourly interval', async () => {
    const type = typeFactory.build({ price: { hourly: 0.007, monthly: 5 } });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: 'us-east', type: type.id } },
      options: {
        flags: { computePricing: { banner: '', billing: 'hourly' } },
      },
    });

    await findByText('$0.007/hour');
  });

  it('should render a DC specific monthly price if the selected region has price overrides', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      price: { hourly: 0.009, monthly: 5 },
      region_prices: [{ id: regionId, hourly: 0.011, monthly: 7 }],
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: regionId, type: type.id } },
      options: {
        flags: { computePricing: { banner: '', billing: 'monthly' } },
      },
    });

    await findByText('$7.00/month');
  });

  it('should render a DC specific hourly price if the selected region has price overrides', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      price: { hourly: 0.009, monthly: 5 },
      region_prices: [{ id: regionId, hourly: 0.011, monthly: 7 }],
    });

    server.use(
      http.get('*/v4/linode/types/*', () => {
        return HttpResponse.json(type);
      })
    );

    const { findByText } = renderWithThemeAndHookFormContext({
      component: <Summary />,
      useFormOptions: { defaultValues: { region: regionId, type: type.id } },
      options: {
        flags: { computePricing: { banner: '', billing: 'hourly' } },
      },
    });

    await findByText('$0.011/hour');
  });

  it('should render a monthly backups price if backups are enabled, a type is selected, and a region is selected', async () => {
    const type = typeFactory.build({
      addons: {
        backups: { price: { hourly: 0.003, monthly: 2 } },
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
      options: {
        flags: { computePricing: { banner: '', billing: 'monthly' } },
      },
    });

    await findByText((_, el) => el?.textContent === '$2.00/month');
  });

  it('should render an hourly backups price if backups are enabled, a type is selected, and a region is selected', async () => {
    const type = typeFactory.build({
      addons: {
        backups: { price: { hourly: 0.003, monthly: 2 } },
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
      options: {
        flags: { computePricing: { banner: '', billing: 'hourly' } },
      },
    });

    await findByText((_, el) => el?.textContent === '$0.003/hour');
  });

  it('should render a DC specific monthly backups price if the region has overrides ', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      addons: {
        backups: {
          price: { hourly: 0.003, monthly: 2 },
          region_prices: [{ id: regionId, hourly: 0.006, monthly: 4.2 }],
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
      options: {
        flags: { computePricing: { banner: '', billing: 'monthly' } },
      },
    });

    await findByText((_, el) => el?.textContent === '$4.20/month');
  });

  it('should render a DC specific hourly backups price if the region has overrides ', async () => {
    const regionId = 'id-cgk';

    const type = typeFactory.build({
      addons: {
        backups: {
          price: { hourly: 0.003, monthly: 2 },
          region_prices: [{ id: regionId, hourly: 0.006, monthly: 4.2 }],
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
      options: {
        flags: { computePricing: { banner: '', billing: 'hourly' } },
      },
    });

    await findByText((_, el) => el?.textContent === '$0.006/hour');
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

    expect(getByText('VLAN')).toBeVisible();
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

  it('should render correct monthly pricing for Marketplace app cluster deployments', async () => {
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
        options: {
          flags: { computePricing: { banner: '', billing: 'monthly' } },
        },
      });

    await findByText(`5 Nodes - $10.00/month`);
  });

  it('should render correct hourly pricing for Marketplace app cluster deployments', async () => {
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
        options: {
          flags: { computePricing: { banner: '', billing: 'hourly' } },
        },
      });

    await findByText(`5 Nodes - $2.500/hour`);
  });

  it('should render correct monthly pricing for Marketplace app cluster deployments with multiple plans involved', async () => {
    const types = [
      typeFactory.build({
        label: 'Dedicated 2GB',
        price: { hourly: 0.1, monthly: 1 },
      }),
      typeFactory.build({
        label: 'Dedicated 4GB',
        price: { hourly: 0.2, monthly: 2 },
      }),
      typeFactory.build({
        label: 'Dedicated 8GB',
        price: { hourly: 0.3, monthly: 3 },
      }),
    ];

    server.use(
      http.get('*/v4*/linode/types/:id', ({ params }) => {
        const type = types.find((type) => type.id === params.id);
        return HttpResponse.json(type);
      }),
      http.get('*/v4*/linode/types', () => {
        return HttpResponse.json(makeResourcePage(types));
      })
    );

    const { findByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Summary />,
        useFormOptions: {
          defaultValues: {
            region: 'fake-region',
            stackscript_data: {
              cluster_size: 1,
              elastic_cluster_size: 2,
              elastic_cluster_type: types[1].label,
              logstash_cluster_size: 2,
              logstash_cluster_type: types[2].label,
            },
            type: types[0].id,
          },
        },
        options: {
          flags: { computePricing: { banner: '', billing: 'monthly' } },
        },
      });

    await findByText(`5 Nodes - $11.00/month`);
  });

  it('should render correct hourly pricing for Marketplace app cluster deployments with multiple plans involved', async () => {
    const types = [
      typeFactory.build({
        label: 'Dedicated 2GB',
        price: { hourly: 0.1, monthly: 1 },
      }),
      typeFactory.build({
        label: 'Dedicated 4GB',
        price: { hourly: 0.2, monthly: 2 },
      }),
      typeFactory.build({
        label: 'Dedicated 8GB',
        price: { hourly: 0.3, monthly: 3 },
      }),
    ];

    server.use(
      http.get('*/v4*/linode/types/:id', ({ params }) => {
        const type = types.find((type) => type.id === params.id);
        return HttpResponse.json(type);
      }),
      http.get('*/v4*/linode/types', () => {
        return HttpResponse.json(makeResourcePage(types));
      })
    );

    const { findByText } =
      renderWithThemeAndHookFormContext<CreateLinodeRequest>({
        component: <Summary />,
        useFormOptions: {
          defaultValues: {
            region: 'fake-region',
            stackscript_data: {
              cluster_size: 1,
              elastic_cluster_size: 2,
              elastic_cluster_type: types[1].label,
              logstash_cluster_size: 2,
              logstash_cluster_type: types[2].label,
            },
            type: types[0].id,
          },
        },
        options: {
          flags: { computePricing: { banner: '', billing: 'hourly' } },
        },
      });

    // 1 x 0.1 + 2 x 0.2 + 2 x 0.3 = 1.1
    await findByText(`5 Nodes - $1.100/hour`);
  });

  it('should render "Encrypted" if a distributed region is selected', async () => {
    const region = regionFactory.build({ site_type: 'distributed' });

    server.use(
      http.get('*/v4*/regions', () => {
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
            defaultValues: { interfaces: [{ vpc_id: 1, subnet_id: 2 }] },
          },
          options: { flags: { linodeInterfaces: { enabled: false } } },
        });

      expect(getByText('VPC')).toBeVisible();
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

      expect(getByText('VLAN')).toBeVisible();
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
        http.get('*/v4*/account', () => {
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

      const text = await findByText('VPC');
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

      const text = await findByText('VLAN');
      expect(text).toBeVisible();
    });

    it('should render "Public Internet" if public interface selected', async () => {
      const { findByText } =
        renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
          component: <Summary />,
          useFormOptions: {
            defaultValues: {
              linodeInterfaces: [{ purpose: 'public' }],
            },
          },
          options: { flags: { linodeInterfaces: { enabled: true } } },
        });

      const text = await findByText('Public Internet');
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
