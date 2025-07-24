import { regionAvailabilityFactory } from '@linode/utilities';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { accountFactory, databaseTypeFactory } from 'src/factories';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import {
  getShadowRootElement,
  mockMatchMedia,
  renderWithTheme,
} from 'src/utilities/testHelpers';

import { DatabaseCreate } from './DatabaseCreate';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({ data: { restricted: false } }),
  useRegionAvailabilityQuery: vi.fn().mockReturnValue({ data: [] }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
    useRegionAvailabilityQuery: queryMocks.useRegionAvailabilityQuery,
  };
});

const standardTypes = [
  databaseTypeFactory.build({
    class: 'nanode',
    id: 'g6-nanode-1',
    label: `Nanode 1 GB`,
    memory: 1024,
  }),
  ...databaseTypeFactory.buildList(7, { class: 'standard' }),
];
const dedicatedTypes = databaseTypeFactory.buildList(7, {
  class: 'dedicated',
});

beforeAll(() => mockMatchMedia());

describe('Database Create', () => {
  it('should render loading state', async () => {
    const { getByTestId } = renderWithTheme(<DatabaseCreate />);
    expect(getByTestId(loadingTestId)).toBeInTheDocument();
  });

  it('should render inputs', async () => {
    const { getAllByTestId, getAllByText } = renderWithTheme(
      <DatabaseCreate />
    );
    await waitForElementToBeRemoved(getAllByTestId(loadingTestId));

    getAllByText('Cluster Label');
    getAllByText('Database Engine');
    getAllByText('Region');
    getAllByText('Choose a Plan');
    getAllByTestId('database-nodes');
    getAllByTestId('domain-transfer-input');
    getAllByText('Create Database Cluster');
  });

  it('should render VPC content when feature flag is present', async () => {
    const { getAllByTestId, getAllByText } = renderWithTheme(
      <DatabaseCreate />,
      {
        flags: { databaseVpc: true },
      }
    );
    await waitForElementToBeRemoved(getAllByTestId(loadingTestId));
    getAllByText('Configure Networking');
  });

  it('should display the correct node price and disable 3 nodes for 1 GB plans', async () => {
    server.use(
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([...standardTypes, ...dedicatedTypes])
        );
      })
    );

    const { getAllByText, getByTestId, getByLabelText, getByText } =
      renderWithTheme(<DatabaseCreate />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const regionSelect = getByLabelText('Region');
    await userEvent.click(regionSelect);
    await userEvent.click(getByText('US, Newark, NJ (us-east)'));

    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Nanode 1 GB')[0];
    await userEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });

  it('should display the correct nodes for account with Managed Databases', async () => {
    server.use(
      http.get('*/account', () => {
        const account = accountFactory.build({
          capabilities: ['Managed Databases'],
        });
        return HttpResponse.json(account);
      })
    );

    const {
      getAllByRole,
      getAllByText,
      getByTestId,
      getByLabelText,
      getByText,
    } = renderWithTheme(<DatabaseCreate />);

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const regionSelect = getByLabelText('Region');
    await userEvent.click(regionSelect);
    await userEvent.click(getByText('US, Newark, NJ (us-east)'));

    const sharedTab = getAllByRole('tab')[1];
    await userEvent.click(sharedTab);
    // default to $0 if no plan is selected
    const nodeRadioBtns = getByTestId('database-nodes');
    expect(nodeRadioBtns).toHaveTextContent('$0/month $0/hr');

    // update node pricing if a plan is selected
    const radioBtn = getAllByText('Linode 2 GB')[0];

    await userEvent.click(radioBtn);
    expect(nodeRadioBtns).toHaveTextContent('$60/month $0.09/hr');
    expect(nodeRadioBtns).not.toHaveTextContent('$100/month $0.15/hr');
    expect(nodeRadioBtns).toHaveTextContent('$140/month $0.21/hr');
  });

  it('should have the "Create Database Cluster" button disabled for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const { getByTestId } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const buttonHost = getByTestId('create-database-cluster');
    const createClusterButton = buttonHost
      ? await getShadowRootElement(buttonHost, 'button')
      : null;

    expect(buttonHost).toBeInTheDocument();
    expect(createClusterButton).toBeDisabled();
  });

  it('should disable form inputs for restricted users', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: true } });

    const {
      findAllByRole,
      findAllByTestId,
      findByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const textInputs = await findAllByTestId('textfield-input');
    textInputs.forEach((input: HTMLInputElement) => {
      expect(input).toBeDisabled();
    });

    const dbEngineSelect = await findByPlaceholderText(
      'Select a Database Engine'
    );
    expect(dbEngineSelect).toBeDisabled();
    const regionSelect = await findByPlaceholderText('Select a Region');
    expect(regionSelect).toBeDisabled();

    const radioButtons = await findAllByRole('radio');
    radioButtons.forEach((radioButton: HTMLElement) => {
      expect(radioButton).toBeDisabled();
    });
  });

  it('should have the "Create Database Cluster" button enabled for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const { getByTestId } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));

    const buttonHost = getByTestId('create-database-cluster');
    const createClusterButton = buttonHost
      ? await getShadowRootElement(buttonHost, 'button')
      : null;

    expect(buttonHost).toBeInTheDocument();
    expect(createClusterButton).toBeEnabled();
  });

  it('should enable form inputs for users with full access', async () => {
    queryMocks.useProfile.mockReturnValue({ data: { restricted: false } });

    const {
      findAllByRole,
      findAllByTestId,
      findByPlaceholderText,
      getByTestId,
    } = renderWithTheme(<DatabaseCreate />);

    expect(getByTestId(loadingTestId)).toBeInTheDocument();

    await waitForElementToBeRemoved(getByTestId(loadingTestId));
    const textInputs = await findAllByTestId('textfield-input');
    textInputs.forEach((input: HTMLInputElement) => {
      expect(input).toBeEnabled();
    });

    const dbEngineSelect = await findByPlaceholderText(
      'Select a Database Engine'
    );
    expect(dbEngineSelect).toBeEnabled();
    const regionSelect = await findByPlaceholderText('Select a Region');
    expect(regionSelect).toBeEnabled();

    const radioButtons = await findAllByRole('radio');
    radioButtons.forEach((radioButton: HTMLElement) => {
      expect(radioButton).toBeEnabled();
    });
  });

  it('should clear plan selection when region is changed to one that does not support that class of plan', async () => {
    const planSizes = [4, 8, 16, 32];
    const premiumPlans = planSizes.map((size) => {
      return databaseTypeFactory.build({
        class: 'premium',
        id: `premium-${size}`,
        label: `DBaaS - Premium ${size} GB`,
        memory: size * 1024,
      });
    });

    server.use(
      http.get('*/account', () => {
        const account = accountFactory.build({
          capabilities: ['Managed Databases'],
        });
        return HttpResponse.json(account);
      }),
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([
            ...standardTypes,
            ...dedicatedTypes,
            ...premiumPlans,
          ])
        );
      })
    );

    const { getAllByRole, queryByTestId, getByLabelText, getByText } =
      await renderWithTheme(<DatabaseCreate />, {
        initialRoute: '/databases/create',
      });

    await waitForElementToBeRemoved(queryByTestId(loadingTestId));

    // Make region selection and switch to region that supports premium plans
    const regionSelect = getByLabelText('Region');
    await userEvent.click(regionSelect);
    await userEvent.click(getByText('US, Washington, DC (us-iad)'));

    // Switch to premium plans tab and make premium plan selection
    const premiumPlansTab = getAllByRole('tab')[2];
    await userEvent.click(premiumPlansTab);

    const premiumPlanRadioBtn = getAllByRole('radio')[3]; // Selected plan is "Premium 32 GB"
    await userEvent.click(premiumPlanRadioBtn);
    expect(premiumPlanRadioBtn).toBeChecked();

    // Confirm that radio selection is cleared after change to a region that does not support premium plans
    await userEvent.click(regionSelect);

    // Switch to region that does not support premium plans and confirm that plan selection is cleared
    await userEvent.click(getByText('AU, Sydney (ap-southeast)'));
    expect(premiumPlanRadioBtn).not.toBeChecked();
    expect(premiumPlanRadioBtn).toBeDisabled();
  });

  it('should clear plan selection when region is changed to one where that plan has limited availability', async () => {
    const planSizes = [4, 8, 16, 32];
    const premiumPlans = planSizes.map((size) => {
      return databaseTypeFactory.build({
        class: 'premium',
        id: `premium-${size}`,
        label: `DBaaS - Premium ${size} GB`,
        memory: size * 1024,
      });
    });

    server.use(
      http.get('*/account', () => {
        const account = accountFactory.build({
          capabilities: ['Managed Databases'],
        });
        return HttpResponse.json(account);
      }),
      http.get('*/databases/types', () => {
        return HttpResponse.json(
          makeResourcePage([
            ...standardTypes,
            ...dedicatedTypes,
            ...premiumPlans,
          ])
        );
      })
    );

    const availabilities = [
      regionAvailabilityFactory.build({
        plan: 'premium-32',
        region: 'us-ord',
        available: false,
      }),
    ];

    // Mock response from region availability query to simulate limited availability for premium-32 plan in us-ord region (Chicago)
    queryMocks.useRegionAvailabilityQuery.mockReturnValue({
      data: availabilities,
    });

    const { getAllByRole, queryByTestId, getByLabelText, getByText } =
      await renderWithTheme(<DatabaseCreate />, {
        initialRoute: '/databases/create',
      });

    await waitForElementToBeRemoved(queryByTestId(loadingTestId));

    // Make region selection
    const regionSelect = getByLabelText('Region');
    await userEvent.click(regionSelect);

    // Switch to region that supports premium plans and switch to premium plans tab.
    await userEvent.click(getByText('US, Washington, DC (us-iad)'));
    const premiumPlansTab = getAllByRole('tab')[2];
    await userEvent.click(premiumPlansTab);

    // Make premium plan selection
    const premiumPlanRadioBtn = getAllByRole('radio')[3]; // Selected plan is "Premium 32 GB"
    await userEvent.click(premiumPlanRadioBtn);
    expect(premiumPlanRadioBtn).toBeChecked();

    // Switch to region that also support premium plans, but has limited availability for the selected plan.
    await userEvent.click(regionSelect);
    await userEvent.click(getByText('US, Chicago, IL (us-ord)'));
    expect(premiumPlanRadioBtn).not.toBeChecked();
  });
});
