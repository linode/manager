import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CustomHeaders } from './CustomHeaders';

interface TestFormValues {
  headers?: {
    name: string;
    value: string;
  }[];
}

const addCustomHeaderButtonText = 'Add Custom Header';
const firstCustomHeaderTitle = 'Custom Header 1';

const renderComponent = () => {
  return renderWithThemeAndHookFormContext<TestFormValues>({
    component: (
      <CustomHeaders controlPath="headers" entity="destination" mode="create" />
    ),
    useFormOptions: { defaultValues: {} },
  });
};

describe('CustomHeaders', () => {
  it('should add a custom header and allow typing its name and value', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();
    await user.click(
      screen.getByRole('button', { name: addCustomHeaderButtonText })
    );

    const nameInput = screen.getByLabelText('Name');
    const valueInput = screen.getByLabelText('Value');

    await user.type(nameInput, 'X-Custom-Header');
    await user.type(valueInput, 'custom-value');

    expect(nameInput).toHaveValue('X-Custom-Header');
    expect(valueInput).toHaveValue('custom-value');
  });

  it('should update the custom header title when its name changes', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();
    await user.click(
      screen.getByRole('button', { name: addCustomHeaderButtonText })
    );

    screen.getByText(firstCustomHeaderTitle);

    await user.type(screen.getByLabelText('Name'), 'Authorization');

    expect(screen.queryByText(firstCustomHeaderTitle)).not.toBeInTheDocument();
    screen.getByText('Authorization');
  });

  it('should remove a custom header', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();
    await user.click(
      screen.getByRole('button', { name: addCustomHeaderButtonText })
    );
    await user.click(screen.getByRole('button', { name: '' }));

    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Value')).not.toBeInTheDocument();
  });

  it('should allow adding multiple custom headers', async () => {
    const user = userEvent.setup({ delay: null });

    renderComponent();
    await user.click(
      screen.getByRole('button', { name: addCustomHeaderButtonText })
    );
    await user.click(
      screen.getByRole('button', { name: addCustomHeaderButtonText })
    );

    expect(screen.getByText(firstCustomHeaderTitle)).toHaveTextContent(
      firstCustomHeaderTitle
    );
    expect(screen.getByText('Custom Header 2')).toHaveTextContent(
      'Custom Header 2'
    );
  });
});
