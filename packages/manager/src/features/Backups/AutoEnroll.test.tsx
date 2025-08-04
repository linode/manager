import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AutoEnroll } from './AutoEnroll';

describe('AutoEnroll display component', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(
      <AutoEnroll enabled={false} toggle={vi.fn()} />
    );
    expect(getByText('Auto Enroll All New Linodes in Backups')).toBeVisible();
  });
  it('enabled prop controls the toggle', () => {
    const { getByRole } = renderWithTheme(
      <AutoEnroll enabled={true} toggle={vi.fn()} />
    );
    expect(getByRole('checkbox')).toBeChecked();
  });
  it('the toggle props works', async () => {
    const toggle = vi.fn();
    const { getByRole } = renderWithTheme(
      <AutoEnroll enabled={true} toggle={toggle} />
    );
    await userEvent.click(getByRole('checkbox'));
    expect(toggle).toBeCalled();
  });
  it('should render its error prop', () => {
    const { getByText } = renderWithTheme(
      <AutoEnroll
        enabled={false}
        error="OMG! This is an error!"
        toggle={vi.fn()}
      />
    );
    expect(getByText('OMG! This is an error!')).toBeVisible();
  });

  it('should disable toggle when user does not have permission', () => {
    const { getByRole } = renderWithTheme(
      <AutoEnroll
        disabled={true}
        enabled={false}
        error="OMG! This is an error!"
        toggle={vi.fn()}
      />
    );
    expect(getByRole('checkbox')).toBeDisabled();
  });
});
