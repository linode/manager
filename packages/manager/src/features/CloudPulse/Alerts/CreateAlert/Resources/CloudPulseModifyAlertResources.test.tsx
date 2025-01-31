import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory, linodeFactory, regionFactory } from 'src/factories';
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

vi.mock('src/queries/regions/regions', () => ({
  ...vi.importActual('src/queries/regions/regions'),
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
      getByPlaceholderText('Search for a Region or Resource')
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
  });
});
