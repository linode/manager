import { linodeFactory, regionFactory } from '@linode/utilities';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory } from 'src/factories';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseModifyAlertResources } from './CloudPulseModifyAlertResources';

import type { CreateAlertDefinitionForm } from '../types';
import type { CloudPulseResources } from 'src/features/CloudPulse/shared/CloudPulseResourcesSelect';

// Mock Data
const alertDetails = alertFactory.build({ service_type: 'linode' });
const linodes = linodeFactory.buildList(4);
const regions = regionFactory.buildList(4).map((region, index) => ({
  ...region,
  id: linodes[index].region,
}));
const checkedAttribute = 'data-qa-checked';
const cloudPulseResources: CloudPulseResources[] = linodes.map((linode) => {
  return {
    id: String(linode.id),
    label: linode.label,
    region: linode.region,
  };
});

// Mock Queries
const queryMocks = vi.hoisted(() => ({
  useAlertDefinitionQuery: vi.fn(),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAlertDefinitionQuery: queryMocks.useAlertDefinitionQuery,
}));

vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

beforeAll(() => {
  // Mock window.scrollTo to prevent the "Not implemented" error
  window.scrollTo = vi.fn();
});

// Shared Setup
beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useAlertDefinitionQuery.mockReturnValue({
    data: alertDetails,
    isError: false,
    isFetching: false,
  });
  queryMocks.useResourcesQuery.mockReturnValue({
    data: cloudPulseResources,
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: regions,
    isError: false,
    isFetching: false,
  });
});

describe('CreateAlertResources component tests', () => {
  it('should be able to render the component on correct props and values', async () => {
    const {
      getByPlaceholderText,
      getByTestId,
      queryByTestId,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: <CloudPulseModifyAlertResources name="entity_ids" />,
      useFormOptions: {
        defaultValues: {
          entity_ids: [],
          serviceType: 'linode',
        },
      },
    });
    expect(
      getByPlaceholderText('Search for a Region or Entity')
    ).toBeInTheDocument();
    expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByTestId('show_selected_only')).toBeInTheDocument();

    // validate, by default selections are there
    expect(getByTestId('select_item_1')).toHaveAttribute(
      checkedAttribute,
      'false'
    );
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'false'
    );

    // validate it selects 3
    await userEvent.click(getByTestId('select_item_3'));
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'true'
    );

    // unselect 3 and test
    await userEvent.click(getByTestId('select_item_3'));
    // validate it gets unselected
    expect(getByTestId('select_item_3')).toHaveAttribute(
      checkedAttribute,
      'false'
    );

    expect(getByTestId('select_all_in_page_1')).toHaveAttribute(
      checkedAttribute,
      'false'
    );
    //   click select all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(getByTestId('select_all_in_page_1')).toHaveAttribute(
      checkedAttribute,
      'true'
    );

    // click select all again to unselect all
    await userEvent.click(getByTestId('select_all_in_page_1'));
    expect(getByTestId('select_all_in_page_1')).toHaveAttribute(
      checkedAttribute,
      'false'
    );
    // no error notice should be there in happy path
    expect(queryByTestId('alert_message_notice')).not.toBeInTheDocument();
  });

  it('should be able to see the error notice if the forms field state has error', async () => {
    const {
      getAllByTestId,
      getByTestId,
      getByText,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: <CloudPulseModifyAlertResources name="entity_ids" />,
      options: {
        flags: {
          aclpAlertServiceTypeConfig: [
            {
              maxResourceSelectionCount: 2,
              serviceType: 'linode',
            },
          ],
        },
      },
      useFormOptions: {
        defaultValues: {
          entity_ids: ['1', '2', '3'],
          serviceType: 'linode',
        },
        errors: {
          entity_ids: {
            message: 'More than 2 entities selected',
          },
        },
      },
    });

    expect(getAllByTestId('alert_message_notice').length).toBe(2); // one for error and one for selection warning
    expect(getByText('You can select up to 2 entities.')).toBeInTheDocument();
    expect(getByText('More than 2 entities selected')).toBeInTheDocument();
    const resourceFour = getByTestId('select_item_4');
    expect(resourceFour).toBeInTheDocument();
    expect(resourceFour).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(getByText('Deselect All'));

    expect(getByText('Select All')).toHaveAttribute('aria-disabled', 'true');
  });
});
