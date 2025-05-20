import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { DOCS_LINK_LABEL_DC_PRICING } from 'src/utilities/pricing/constants';
import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { TwoStepRegion } from './TwoStepRegion';

describe('TwoStepRegion', () => {
  it('should render a heading and docs link', () => {
    const { getAllByText, getByText } = renderWithThemeAndHookFormContext({
      component: <TwoStepRegion onChange={vi.fn()} />,
    });

    const heading = getAllByText('Region')[0];
    const link = getByText(DOCS_LINK_LABEL_DC_PRICING);

    expect(heading).toBeVisible();
    expect(heading.tagName).toBe('H2');

    expect(link).toBeVisible();
    expect(link).toHaveRole('link');
    expect(link).toHaveAttribute('href', 'https://www.linode.com/pricing');
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

  it('should only display core regions in the Core tab region select', async () => {
    const { getByPlaceholderText, getByRole } =
      renderWithThemeAndHookFormContext({
        component: <TwoStepRegion onChange={vi.fn()} />,
      });

    const select = getByPlaceholderText('Select a Region');
    await userEvent.click(select);

    const dropdown = getByRole('listbox');
    expect(dropdown.innerHTML).toContain('US, Newark');
    expect(dropdown.innerHTML).not.toContain(
      'US, Gecko Distributed Region Test'
    );
  });

  it('should only display distributed regions in the Distributed tab region select', async () => {
    const { getAllByRole, getByPlaceholderText, getByRole } =
      renderWithThemeAndHookFormContext({
        component: <TwoStepRegion onChange={vi.fn()} />,
      });

    const tabs = getAllByRole('tab');
    await userEvent.click(tabs[1]);

    const select = getByPlaceholderText('Select a Region');
    await userEvent.click(select);

    const dropdown = getByRole('listbox');
    expect(dropdown.innerHTML).toContain('US, Gecko Distributed Region Test');
    expect(dropdown.innerHTML).not.toContain('US, Newark');
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
