import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  alertFactory,
  firewallMetricRulesFactory,
  firewallNodebalancerMetricCriteria,
  notificationChannelFactory,
} from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UPDATE_ALERT_SUCCESS_MESSAGE } from '../constants';
import { EditAlertDefinition } from './EditAlertDefinition';

const navigate = vi.fn();
const queryMocks = vi.hoisted(() => ({
  useAllAlertNotificationChannelsQuery: vi.fn(),
  useEditAlertDefinition: vi.fn(),
  useNavigate: vi.fn(() => navigate),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAllAlertNotificationChannelsQuery:
    queryMocks.useAllAlertNotificationChannelsQuery,
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  Element.prototype.scrollIntoView = vi.fn();
  queryMocks.useEditAlertDefinition.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
  queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue(
    notificationChannelFactory.build()
  );
  HTMLElement.prototype.scrollIntoView = vi.fn();
});

const alertDetails = alertFactory.build({
  id: 1,
  service_type: 'linode',
  scope: 'entity',
});

const ENTITY_TYPE_SELECT_TEST_ID = 'entity-type-select';

describe('EditAlertDefinition component', () => {
  it('renders the components of the form', { timeout: 20000 }, async () => {
    const { findByPlaceholderText, getByLabelText, getByText } =
      renderWithTheme(
        <EditAlertDefinition alertDetails={alertDetails} serviceType="linode" />
      );
    expect(getByText('1. General Information')).toBeVisible();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
    expect(getByLabelText('Service')).toBeVisible();
    expect(getByText('2. Entities')).toBeVisible();
    expect(
      await findByPlaceholderText('Search for a Region or Entity')
    ).toBeInTheDocument();
    expect(await findByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByText('3. Criteria')).toBeVisible();
    expect(getByText('Metric Threshold')).toBeVisible();
    expect(getByLabelText('Data Field')).toBeVisible();
    expect(getByLabelText('Aggregation Type')).toBeVisible();
    expect(getByLabelText('Operator')).toBeVisible();
    expect(getByLabelText('Threshold')).toBeVisible();
    expect(getByLabelText('Evaluation Period')).toBeVisible();
    expect(getByLabelText('Polling Interval')).toBeVisible();
    expect(getByText('4. Notification Channels')).toBeVisible();
  });

  it('should submit form data correctly', { timeout: 10000 }, async () => {
    navigate({
      to: '/alerts/definitions/edit/linode/1',
    });
    const mutateAsyncSpy = queryMocks.useEditAlertDefinition().mutateAsync;
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <EditAlertDefinition alertDetails={alertDetails} serviceType="linode" />
    );
    const descriptionValue = 'Updated Description';
    const nameValue = 'Updated Label';
    const nameInput = getByPlaceholderText('Enter a Name');
    const descriptionInput = getByPlaceholderText('Enter a Description');
    await userEvent.clear(nameInput);
    await userEvent.clear(descriptionInput);
    await userEvent.type(nameInput, nameValue);

    await userEvent.type(descriptionInput, descriptionValue);

    await userEvent.click(getByText('Submit'));

    await waitFor(() => expect(mutateAsyncSpy).toHaveBeenCalledTimes(1));

      expect(navigate).toHaveBeenLastCalledWith({
        to: '/alerts/definitions',
      });
      await waitFor(() => {
        expect(
          getByText(UPDATE_ALERT_SUCCESS_MESSAGE) // validate whether snackbar is displayed properly
        ).toBeInTheDocument();
      });
    });

  it('should render EntityTypeSelect for firewall with Linode entity type', () => {
    const linodeFirewallAlertDetails = alertFactory.build({
      id: 1,
      rule_criteria: {
        rules: [firewallMetricRulesFactory.build()],
      },
      scope: 'entity',
      service_type: 'firewall',
    });

    const { getByTestId } = renderWithTheme(
      <EditAlertDefinition
        alertDetails={linodeFirewallAlertDetails}
        serviceType="firewall"
      />
    );

    const entityTypeSelect = getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
    expect(entityTypeSelect).toBeVisible();

    const combobox = within(entityTypeSelect).getByRole('combobox');
    expect(combobox).toHaveAttribute('value', 'Linodes');
  });

  it('should render EntityTypeSelect for firewall with NodeBalancer entity type', () => {
    const nodebalancerFirewallAlertDetails = alertFactory.build({
      id: 2,
      rule_criteria: {
        rules: [firewallNodebalancerMetricCriteria.build()],
      },
      scope: 'entity',
      service_type: 'firewall',
    });

    const { getByTestId } = renderWithTheme(
      <EditAlertDefinition
        alertDetails={nodebalancerFirewallAlertDetails}
        serviceType="firewall"
      />
    );

    const entityTypeSelect = getByTestId(ENTITY_TYPE_SELECT_TEST_ID);
    expect(entityTypeSelect).toBeVisible();

    const combobox = within(entityTypeSelect).getByRole('combobox');
    expect(combobox).toHaveAttribute('value', 'NodeBalancers');
  });

  it('should not render EntityTypeSelect for non-firewall service types', () => {
    const { queryByTestId } = renderWithTheme(
      <EditAlertDefinition alertDetails={alertDetails} serviceType="linode" />
    );

    expect(queryByTestId(ENTITY_TYPE_SELECT_TEST_ID)).not.toBeInTheDocument();
  });
});
