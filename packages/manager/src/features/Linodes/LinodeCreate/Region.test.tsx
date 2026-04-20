import {
  linodeFactory,
  linodeTypeFactory,
  regionFactory,
} from '@linode/utilities';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import { useWatch } from 'react-hook-form';

import { accountSettingsFactory, imageFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Region } from './Region';

import type { LinodeCreateFormValues } from './utilities';
import type {
  LinodeInterfaceAccountSetting,
  Region as RegionType,
} from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
  userPermissions: vi.fn(() => ({
    data: {
      create_linode: false,
    },
  })),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

describe('Region', () => {
  beforeEach(() => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linodes/create',
    });
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({
      type: 'Clone Linode',
    });
    queryMocks.useParams.mockReturnValue({});
  });

  it('should render a heading', () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const heading = getAllByText('Region')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should disable the region select is the user does not have create_linode permission', async () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const select = getByPlaceholderText('Select a Region');
    expect(select).toBeInTheDocument();
    expect(select).toBeDisabled();
  });

  it('should enable the region select is the user has create_linode permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_linode: true,
      },
    });
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <Region />,
    });

    const select = getByPlaceholderText('Select a Region');
    expect(select).toBeInTheDocument();
    expect(select).toBeEnabled();
  });

  it('should render regions returned by the API', async () => {
    const regions = regionFactory.buildList(5, { capabilities: ['Linodes'] });

    server.use(
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage(regions));
      })
    );

    const { findByText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext({
        component: <Region />,
      });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    for (const region of regions) {
      expect(
        await findByText(`US, ${region.label} (${region.id})`)
      ).toBeVisible();
    }
  });

  it('renders a warning if the user selects a region with different pricing when cloning', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linodes/create/clone',
    });
    const regionA = regionFactory.build({ capabilities: ['Linodes'] });
    const regionB = regionFactory.build({ capabilities: ['Linodes'] });

    const type = linodeTypeFactory.build({
      region_prices: [{ hourly: 99, id: regionB.id, monthly: 999 }],
    });

    const linode = linodeFactory.build({ region: regionA.id, type: type.id });

    queryMocks.useParams.mockReturnValue({
      linodeId: linode.id,
    });

    server.use(
      http.get('*/v4/linode/types/:id', () => {
        return HttpResponse.json(type);
      }),
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([regionA, regionB]));
      })
    );

    const { findByText, getByPlaceholderText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Region />,
        useFormOptions: {
          defaultValues: {
            linode,
          },
        },
      });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    await userEvent.click(
      await findByText(`US, ${regionB.label} (${regionB.id})`)
    );

    await findByText('The selected region has a different price structure.');
  });

  it('renders a warning if the user tries to clone across datacenters', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/linodes/create/clone',
    });
    const regionA = regionFactory.build({ capabilities: ['Linodes'] });
    const regionB = regionFactory.build({ capabilities: ['Linodes'] });

    const linode = linodeFactory.build({ region: regionA.id });

    server.use(
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(makeResourcePage([regionA, regionB]));
      })
    );

    const { findByText, getByPlaceholderText, getByText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Region />,
        useFormOptions: {
          defaultValues: {
            linode,
          },
        },
      });

    const select = getByPlaceholderText('Select a Region');

    await userEvent.click(select);

    await userEvent.click(
      await findByText(`US, ${regionB.label} (${regionB.id})`)
    );

    expect(
      getByText(
        'Cloning a powered off instance across data centers may cause long periods of down time.'
      )
    ).toBeVisible();
  });

  describe('interface_generation auto-switch', () => {
    const InterfaceGenerationProbe = () => {
      const value = useWatch<LinodeCreateFormValues, 'interface_generation'>({
        name: 'interface_generation',
      });
      return <span data-testid="interface-generation-probe">{value}</span>;
    };

    const setup = (
      regions: RegionType[],
      interfacesForNewLinodes: LinodeInterfaceAccountSetting = 'linode_default_but_legacy_config_allowed'
    ) => {
      server.use(
        http.get('*/v4*/account/settings', () =>
          HttpResponse.json(
            accountSettingsFactory.build({
              interfaces_for_new_linodes: interfacesForNewLinodes,
            })
          )
        ),
        http.get('*/v4*/regions', () =>
          HttpResponse.json(makeResourcePage(regions))
        )
      );
      return renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: (
          <>
            <Region />
            <InterfaceGenerationProbe />
          </>
        ),
        useFormOptions: {
          defaultValues: { interface_generation: 'linode' },
        },
      });
    };

    const pickRegion = async (
      result: ReturnType<typeof setup>,
      region: RegionType
    ) => {
      await userEvent.click(result.getByPlaceholderText('Select a Region'));
      await userEvent.click(
        await result.findByText(`US, ${region.label} (${region.id})`)
      );
    };

    it('switches interface_generation to legacy_config when the selected region lacks Linode Interfaces capability', async () => {
      const regionA = regionFactory.build({ capabilities: ['Linodes'] });
      const regionB = regionFactory.build({ capabilities: ['Linodes'] });
      const result = setup([regionA, regionB]);

      await pickRegion(result, regionB);

      expect(
        result.getByTestId('interface-generation-probe')
      ).toHaveTextContent('legacy_config');
    });

    it('does not switch interface_generation when the account setting enforces linode_only', async () => {
      const region = regionFactory.build({ capabilities: ['Linodes'] });
      const result = setup([region], 'linode_only');

      await pickRegion(result, region);

      expect(
        result.getByTestId('interface-generation-probe')
      ).toHaveTextContent('linode');
    });

    it('leaves interface_generation alone when the selected region supports Linode Interfaces', async () => {
      const region = regionFactory.build({
        capabilities: ['Linodes', 'Linode Interfaces'],
      });
      const result = setup([region]);

      await pickRegion(result, region);

      expect(
        result.getByTestId('interface-generation-probe')
      ).toHaveTextContent('linode');
    });
  });

  // TODO: this is an expected failure until we fix the filtering
  it.skip('should disable distributed regions if the selected image does not have the `distributed-sites` capability', async () => {
    const image = imageFactory.build({ capabilities: [] });

    const distributedRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'distributed',
    });
    const coreRegion = regionFactory.build({
      capabilities: ['Linodes'],
      site_type: 'core',
    });

    server.use(
      http.get('*/v4*/regions', () => {
        return HttpResponse.json(
          makeResourcePage([coreRegion, distributedRegion])
        );
      }),
      http.get('*/v4/images/:id', () => {
        return HttpResponse.json(image);
      })
    );

    const { findByText, getByLabelText } =
      renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
        component: <Region />,
        useFormOptions: {
          defaultValues: {
            image: image.id,
          },
        },
      });

    const regionSelect = getByLabelText('Region');

    await userEvent.click(regionSelect);

    const distributedRegionOption = await findByText(distributedRegion.id, {
      exact: false,
    });

    expect(distributedRegionOption.closest('li')?.textContent).toContain(
      'The selected image cannot be deployed to a distributed region.'
    );
  });
});
