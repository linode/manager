import { breakpoints } from '@linode/ui';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { extendedTypeFactory } from 'src/factories/types';
import { LIMITED_AVAILABILITY_COPY } from 'src/features/components/PlansPanel/constants';
import { PlanWithAvailability } from 'src/features/components/PlansPanel/types';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import { KubernetesPlanSelection } from './KubernetesPlanSelection';

import type { KubernetesPlanSelectionProps } from './KubernetesPlanSelection';

const planHeader = 'Dedicated 20 GB';
const baseHourlyPrice = '$0.015';
const baseMonthlyPrice = '$10';
const regionHourlyPrice = '$0.018';
const regionMonthlyPrice = '$12.20';
const ram = '16 GB';
const cpu = '8';
const storage = '1024 GB';

const PlanWithAvailability: PlanWithAvailability = {
  ...extendedTypeFactory.build(),
  planBelongsToDisabledClass: false,
  planHasLimitedAvailability: false,
  planIsDisabled512Gb: false,
};

const props: KubernetesPlanSelectionProps = {
  getTypeCount: vi.fn(),
  hasMajorityOfPlansDisabled: false,
  idx: 0,
  onAdd: vi.fn(),
  onSelect: vi.fn(),
  plan: PlanWithAvailability,
  selectedRegionId: 'us-east',
  selectedTier: 'standard',
  updatePlanCount: vi.fn(),
  wholePanelIsDisabled: false,
};

describe('KubernetesPlanSelection (table, desktop view)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.lg);
  });

  it('displays the plan header label, monthly and hourly price, RAM, CPUs, storage, and quantity selection', async () => {
    const { getByText, queryByTestId } = render(
      wrapWithTableBody(<KubernetesPlanSelection {...props} />)
    );

    const quantity = queryByTestId('quantity-input');
    const addPlanButton = getByText('Add', { exact: true }).closest('button');

    expect(getByText(planHeader)).toBeInTheDocument();
    expect(getByText(baseHourlyPrice)).toBeInTheDocument();
    expect(getByText(baseMonthlyPrice)).toBeInTheDocument();
    expect(getByText(ram)).toBeInTheDocument();
    expect(getByText(cpu)).toBeInTheDocument();
    expect(getByText(storage)).toBeInTheDocument();

    expect(quantity).toBeInTheDocument();
    expect(addPlanButton).toBeInTheDocument();
  });

  it('displays DC-specific prices in a region with a price increase', async () => {
    const { queryByText } = render(
      wrapWithTableBody(
        <KubernetesPlanSelection {...props} selectedRegionId="id-cgk" />
      )
    );

    expect(queryByText(regionHourlyPrice)).toBeInTheDocument();
    expect(queryByText(regionMonthlyPrice)).toBeInTheDocument();
  });

  it('should not display an error message for $0 regions', () => {
    const propsWithRegionZeroPrice = {
      ...props,
      plan: {
        ...extendedTypeFactory.build({
          region_prices: [
            {
              hourly: 0,
              id: 'id-cgk',
              monthly: 0,
            },
          ],
        }),
      },
    };
    const { container } = renderWithTheme(
      wrapWithTableBody(
        <KubernetesPlanSelection
          {...propsWithRegionZeroPrice}
          selectedRegionId={'id-cgk'}
        />
      )
    );

    const monthlyTableCell = container.querySelector('[data-qa-monthly]');
    const hourlyTableCell = container.querySelector('[data-qa-hourly]');
    expect(monthlyTableCell).toHaveTextContent('$0');
    // error tooltip button should not display
    expect(
      monthlyTableCell?.querySelector('[data-qa-help-button]')
    ).not.toBeInTheDocument();
    expect(hourlyTableCell).toHaveTextContent('$0');
    expect(
      hourlyTableCell?.querySelector('[data-qa-help-button]')
    ).not.toBeInTheDocument();
  });

  it('shows limited availability messaging for 512 GB plans', async () => {
    const bigPlanType: PlanWithAvailability = {
      ...extendedTypeFactory.build({
        heading: 'Dedicated 512 GB',
        label: 'Dedicated 512GB',
      }),
      planBelongsToDisabledClass: false,
      planHasLimitedAvailability: true,
      planIsDisabled512Gb: false,
    };

    const { getByRole, getByTestId, getByText } = renderWithTheme(
      wrapWithTableBody(
        <KubernetesPlanSelection {...props} plan={bigPlanType} />
      )
    );

    const button = getByTestId('disabled-plan-tooltip');
    fireEvent.mouseOver(button);

    await waitFor(() => {
      expect(getByRole('tooltip')).toBeInTheDocument();
    });

    expect(getByText(LIMITED_AVAILABILITY_COPY)).toBeVisible();
  });
});

describe('KubernetesPlanSelection (cards, mobile view)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.sm);
  });

  it('displays the plan header label, monthly and hourly price, RAM, CPUs, and storage', async () => {
    const { getByText } = renderWithTheme(
      <KubernetesPlanSelection {...props} />
    );

    expect(getByText(planHeader)).toBeInTheDocument();
    expect(
      getByText(`${baseMonthlyPrice}/mo`, { exact: false })
    ).toBeInTheDocument();
    expect(
      getByText(`${baseHourlyPrice}/hr`, { exact: false })
    ).toBeInTheDocument();
    expect(getByText(`${cpu} CPU`, { exact: false })).toBeInTheDocument();
    expect(
      getByText(`${storage} Storage`, { exact: false })
    ).toBeInTheDocument();
    expect(getByText(`${ram} RAM`, { exact: false })).toBeInTheDocument();
  });

  it('displays DC-specific prices in a region with a price increase', async () => {
    const { getByText } = renderWithTheme(
      <KubernetesPlanSelection {...props} selectedRegionId="id-cgk" />
    );

    expect(
      getByText(`${regionMonthlyPrice}/mo`, { exact: false })
    ).toBeInTheDocument();
    expect(
      getByText(`${regionHourlyPrice}/hr`, { exact: false })
    ).toBeInTheDocument();
  });
});
