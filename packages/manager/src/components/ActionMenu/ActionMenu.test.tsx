import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ActionMenu } from './ActionMenu';

afterEach(() => {
  vi.clearAllMocks();
});

describe('ActionMenu', () => {
  const action1 = { onClick: vi.fn(), title: 'whatever' };
  const action2 = { onClick: vi.fn(), title: 'whatever2' };
  const action3 = {
    disabled: true,
    onClick: vi.fn(),
    title: 'whatever3',
    tooltip: 'helper text for tooltip',
  };

  const standardActions = [action1, action2];
  const standardAndDisabledActions = [...standardActions, action3];
  it('should include the correct actions', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ActionMenu actionsList={standardActions} ariaLabel="action menu" />
    );
    const actionMenu = getByLabelText('action menu');
    fireEvent.click(actionMenu);
    const a1 = getByText('whatever');
    expect(a1).toBeVisible();
    const a2 = getByText('whatever2');
    expect(a2).toBeVisible();
  });
  it('should call the associated onClick function when clicking on an enabled action', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ActionMenu actionsList={standardActions} ariaLabel="action menu" />
    );
    const actionMenu = getByLabelText('action menu');
    fireEvent.click(actionMenu);
    const a1 = getByText('whatever');
    fireEvent.click(a1);
    expect(action1.onClick).toHaveBeenCalled();
    const a2 = getByText('whatever2');
    fireEvent.click(a2);
    expect(action2.onClick).toHaveBeenCalled();
  });
  it('should have a tooltip if provided and not call the associated onClick function when clicking on a disabled action', () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <ActionMenu
        actionsList={standardAndDisabledActions}
        ariaLabel="action menu"
      />
    );
    const actionMenu = getByLabelText('action menu');
    fireEvent.click(actionMenu);
    const a3 = getByText('whatever3');
    fireEvent.click(a3);
    expect(action3.onClick).not.toHaveBeenCalled();
    const tooltip = getByLabelText('helper text for tooltip');
    expect(tooltip).toBeInTheDocument();
    fireEvent.click(tooltip);
    expect(tooltip).toBeVisible();
  });
});
