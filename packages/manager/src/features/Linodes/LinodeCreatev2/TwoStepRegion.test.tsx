import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TwoStepRegion } from './TwoStepRegion';

describe('TwoStepRegion', () => {
  it('should render a heading', () => {
    const { getAllByText } = renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const heading = getAllByText('Region')[0];

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');
  });

  it('should render two tabs, Core and Distributed', () => {
    const { getAllByRole } = renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const tabs = getAllByRole('tab');
    expect(tabs[0]).toHaveTextContent('Core');
    expect(tabs[1]).toHaveTextContent('Distributed');
  });

  it('should render a Region Select for the Core tab', () => {
    const { getByPlaceholderText } = renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const select = getByPlaceholderText('Select a Region');

    expect(select).toBeVisible();
    expect(select).toBeEnabled();
  });

  it('should render a Geographical Area select with All pre-selected and a Region Select for the Distributed tab', async () => {
    const { getAllByRole } = renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const tabs = getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const inputs = getAllByRole('combobox');
    const geographicalAreaSelect = inputs[0];
    const regionSelect = inputs[1];

    expect(geographicalAreaSelect).toHaveAttribute('value', 'All');
    expect(regionSelect).toHaveAttribute('placeholder', 'Select a Region');
    expect(regionSelect).toBeEnabled();
  });
});
