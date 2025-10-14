import { regionFactory } from '@linode/utilities';
import * as React from 'react';

import { typeFactory } from 'src/factories';
import { nodePoolFactory } from 'src/factories/kubernetesCluster';
import { UNKNOWN_PRICE } from 'src/utilities/pricing/constants';
import { LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE } from 'src/utilities/pricing/constants';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import KubeCheckoutBar from './KubeCheckoutBar';

import type { Props } from './KubeCheckoutBar';

const pools = nodePoolFactory.buildList(5, { count: 3, type: 'g6-standard-1' });

const props: Props = {
  createCluster: vi.fn(),
  hasAgreed: false,
  highAvailability: false,
  highAvailabilityPrice: '60',
  pools,
  region: 'us-east',
  regionsData: regionFactory.buildList(1),
  submitting: false,
  toggleHasAgreed: vi.fn(),
};

describe('KubeCheckoutBar', () => {
  beforeAll(() => {
    vi.mock('@linode/queries', async () => {
      const actual = await vi.importActual('@linode/queries');
      return {
        ...actual,
        useSpecificTypes: vi
          .fn()
          .mockImplementation(() => [{ data: typeFactory.build() }]),
      };
    });
  });

  it('should render helper text and disable create button until a region has been selected', async () => {
    const { findByText, getByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} region={undefined} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    await findByText(LKE_CREATE_CLUSTER_CHECKOUT_MESSAGE);
    expect(getByText('Create Cluster').closest('button')).toHaveAttribute(
      'aria-disabled',
      'true'
    );
  });

  it('should render a section for each pool', async () => {
    const { queryAllByTestId } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    expect(queryAllByTestId('node-pool-summary')).toHaveLength(pools.length);
  });

  it('should not show a warning if all pools have 3 nodes or more', () => {
    const { queryAllByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });
    expect(queryAllByText(/minimum of 3 nodes/i)).toHaveLength(0);
  });

  it('should render additional pricing text and link', async () => {
    const { findByText, getByRole } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });
    expect(
      await findByText(
        /Additional services added to the cluster may incur charges./i
      )
    ).toBeVisible();

    const additionalPricingLink = getByRole('link');
    expect(additionalPricingLink).toHaveTextContent('See pricing');
    expect(additionalPricingLink).toHaveAttribute(
      'href',
      'https://www.linode.com/pricing/'
    );
  });

  it('should show a warning if any pool has fewer than 3 nodes', async () => {
    const poolsWithSmallNode = [...pools, nodePoolFactory.build({ count: 2 })];
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} pools={poolsWithSmallNode} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    await findByText(/minimum of 3 nodes/i);
  });

  it('should display the total price of the cluster without High Availability', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 10 per linode
    await findByText(/\$150\.00/);
  });

  it('should display the total price of the cluster with High Availability', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} highAvailability />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 10 per linode + 60 per month per cluster for HA
    await findByText(/\$210\.00/);
  });

  it('should display the DC-Specific total price of the cluster for a region with a price increase without HA selection', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} region="id-cgk" />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + 72 per month per cluster for HA
    await findByText(/\$183\.00/);
  });

  it('should display the DC-Specific total price of the cluster for a region with a price increase with HA selection', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: (
        <KubeCheckoutBar
          {...props}
          highAvailability
          highAvailabilityPrice="72"
          region="id-cgk"
        />
      ),
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + 72 per month per cluster for HA
    await findByText(/\$255\.00/);
  });

  it('should display UNKNOWN_PRICE for HA when not available and show total price of cluster as the sum of the node pools', async () => {
    const { findByText, getByText } = renderWithThemeAndHookFormContext({
      component: (
        <KubeCheckoutBar
          {...props}
          highAvailability
          highAvailabilityPrice={UNKNOWN_PRICE}
          region="id-cgk"
        />
      ),
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 12 per linode * 20% increase for Jakarta + UNKNOWN_PRICE
    await findByText(/\$183\.00/);
    getByText(/\$--.--\/month/);
  });

  it('should display the total price of the cluster with LKE Enterprise', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: <KubeCheckoutBar {...props} enterprisePrice={300} />,
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 10 per linode + 300 per month for enterprise (HA included)
    await findByText(/\$450\.00/);
  });

  it('should ignore standard HA pricing for LKE Enterprise', async () => {
    const { findByText } = renderWithThemeAndHookFormContext({
      component: (
        <KubeCheckoutBar
          {...props}
          enterprisePrice={300}
          highAvailability
          highAvailabilityPrice="60"
        />
      ),
      useFormOptions: {
        defaultValues: {
          nodePools: [nodePoolFactory.build()],
        },
      },
    });

    // 5 node pools * 3 linodes per pool * 10 per linode + 300 per month for enterprise (HA included)
    await findByText(/\$450\.00/);
  });
});
