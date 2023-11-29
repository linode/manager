import { render } from '@testing-library/react';
import * as React from 'react';

import { extendedTypeFactory } from 'src/factories/types';
import { breakpoints } from 'src/foundations/breakpoints';
import {
  renderWithTheme,
  resizeScreenSize,
  wrapWithTableBody,
} from 'src/utilities/testHelpers';

import {
  KubernetesPlanSelection,
  KubernetesPlanSelectionProps,
} from './KubernetesPlanSelection';

const planHeader = 'Dedicated 20 GB';
const baseHourlyPrice = '$0.015';
const baseMonthlyPrice = '$10';
const regionHourlyPrice = '$0.018';
const regionMonthlyPrice = '$12.20';
const ram = '16 GB';
const cpu = '8';
const storage = '1024 GB';

const extendedType = extendedTypeFactory.build();

const props: KubernetesPlanSelectionProps = {
  getTypeCount: vi.fn(),
  idx: 0,
  onAdd: vi.fn(),
  onSelect: vi.fn(),
  selectedRegionID: 'us-east',
  type: extendedType,
  updatePlanCount: vi.fn(),
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
        <KubernetesPlanSelection {...props} selectedRegionID="id-cgk" />
      )
    );

    expect(queryByText(regionHourlyPrice)).toBeInTheDocument();
    expect(queryByText(regionMonthlyPrice)).toBeInTheDocument();
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
        <KubernetesPlanSelection {...props} selectedRegionID="id-cgk" />
      );

      expect(
        getByText(`${regionMonthlyPrice}/mo`, { exact: false })
      ).toBeInTheDocument();
      expect(
        getByText(`${regionHourlyPrice}/hr`, { exact: false })
      ).toBeInTheDocument();
    });
  });
});
