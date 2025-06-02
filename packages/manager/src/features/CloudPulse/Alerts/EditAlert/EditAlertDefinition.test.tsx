import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory, notificationChannelFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

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
});

const alertDetails = alertFactory.build({
  id: 1,
  service_type: 'linode',
});
describe('EditAlertDefinition component', () => {
  it(
    'renders the components of the form',
    async () => {
      const { findByPlaceholderText, getByLabelText, getByText } =
        await renderWithThemeAndRouter(
          <EditAlertDefinition
            alertDetails={alertDetails}
            serviceType="linode"
          />
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
    },
    { timeout: 20000 }
  );

  it(
    'should submit form data correctly',
    async () => {
      navigate({
        to: '/alerts/definitions/edit/linode/1',
      });
      const mutateAsyncSpy = queryMocks.useEditAlertDefinition().mutateAsync;
      const { getByPlaceholderText, getByText } =
        await renderWithThemeAndRouter(
          <EditAlertDefinition
            alertDetails={alertDetails}
            serviceType="linode"
          />
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
    },
    { timeout: 10000 }
  );
});
