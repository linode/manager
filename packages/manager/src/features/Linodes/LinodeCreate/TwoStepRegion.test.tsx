import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TwoStepRegion } from './TwoStepRegion';

describe('TwoStepRegion', () => {
  it('should render a heading and docs link', () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const heading = screen.getAllByText('Region')[0];
    const link = screen.getByText(DOCS_LINK_LABEL_DC_PRICING);

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');

    expect(link).toBeVisible();
    expect(link).toHaveRole('link');
    expect(link).toHaveAttribute('href', 'https://www.linode.com/pricing');
  });

  it('should render two tabs, Core and Distributed', () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const [coreTab, distributedTab] = screen.getAllByRole('tab');

    expect(coreTab).toHaveTextContent('Core');
    expect(distributedTab).toHaveTextContent('Distributed');
  });

  it('should render a Region Select for the Core tab', () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const regionSelect = screen.getByPlaceholderText('Select a Region');

    expect(regionSelect).toBeVisible();
    expect(regionSelect).toBeEnabled();
  });

  it('should only display core regions in the Core tab region select', async () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const regionSelect = screen.getByPlaceholderText('Select a Region');
    await userEvent.click(regionSelect);

    const dropdown = screen.getByRole('listbox');
    expect(dropdown.innerHTML).toContain('US, Newark');
    expect(dropdown.innerHTML).not.toContain(
      'US, Gecko Distributed Region Test'
    );
  });

  it('should only display distributed regions in the Distributed tab region select', async () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const distributedTab = screen.getByRole('tab', { name: 'Distributed' });
    await userEvent.click(distributedTab);

    const regionSelect = screen.getByPlaceholderText('Select a Region');
    await userEvent.click(regionSelect);

    const dropdown = screen.getByRole('listbox');
    expect(dropdown.innerHTML).toContain('US, Gecko Distributed Region Test');
    expect(dropdown.innerHTML).not.toContain('US, Newark');
  });

  it('should render a Geographical Area select with All pre-selected and a Region Select for the Distributed tab', async () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const [, distributedTab] = screen.getAllByRole('tab');
    await userEvent.click(distributedTab);

    const [geographicalAreaSelect, regionSelect] =
      screen.getAllByRole('combobox');

    expect(geographicalAreaSelect).toHaveAttribute('value', 'All');
    expect(regionSelect).toHaveAttribute('placeholder', 'Select a Region');
    expect(regionSelect).toBeEnabled();
  });

  it('should persist the selected Geographical Area when switching between the Core and Distributed tabs', async () => {
    renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const [coreTab, distributedTab] = screen.getAllByRole('tab');
    await userEvent.click(distributedTab);

    const geographicalAreaSelect = screen.getByLabelText('Geographical Area');
    // Open the dropdown
    await userEvent.click(geographicalAreaSelect);

    const lastMonthOption = screen.getByText('North America');
    await userEvent.click(lastMonthOption);
    expect(geographicalAreaSelect).toHaveAttribute('value', 'North America');

    // Geographical area selection should persist after switching tabs
    await userEvent.click(coreTab);
    await userEvent.click(distributedTab);
    const geographicalAreaSelect2 = screen.getByLabelText('Geographical Area');
    expect(geographicalAreaSelect2).toHaveAttribute('value', 'North America');
  });
});
