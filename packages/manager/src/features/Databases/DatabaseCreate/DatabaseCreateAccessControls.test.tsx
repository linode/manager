import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';

import type { DatabaseCreateValues } from './DatabaseCreate';

vi.mock('src/features/Databases/utilities');

describe('DatabaseCreateAccessControls', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Should render enabled', () => {
    const ips = [{ address: '' }];
    const { container, getAllByText, getAllByTestId } =
      renderWithThemeAndHookFormContext<DatabaseCreateValues>({
        component: <DatabaseCreateAccessControls />,
        useFormOptions: { defaultValues: { allow_list: ips } },
      });

    expect(getAllByText('Manage Access')).toHaveLength(1);
    expect(getAllByTestId('domain-transfer-input')).toHaveLength(1);
    expect(getAllByTestId('button')).toHaveLength(1);

    const specificRadio = container.querySelector(
      '[data-qa-dbaas-radio="Specific"]'
    );
    const noneRadio = container.querySelector('[data-qa-dbaas-radio="None"]');
    const enabledButtons = container.querySelectorAll(
      '[aria-disabled="false"]'
    );

    expect(specificRadio).toBeInTheDocument();
    expect(noneRadio).toBeInTheDocument();
    expect(enabledButtons).toHaveLength(1);
  });

  it('Should render ips', () => {
    const ips = [
      { address: '1.1.1.1/32' },
      { address: '2.2.2.2' },
      { address: '3.3.3.3/128' },
    ];
    const { container, getAllByText, getAllByTestId } =
      renderWithThemeAndHookFormContext<DatabaseCreateValues>({
        component: <DatabaseCreateAccessControls />,
        useFormOptions: { defaultValues: { allow_list: ips } },
      });

    expect(getAllByText('Manage Access')).toHaveLength(1);
    expect(getAllByTestId('domain-transfer-input')).toHaveLength(3);
    expect(getAllByTestId('button')).toHaveLength(3);

    const specificRadio = container.querySelector(
      '[data-qa-dbaas-radio="Specific"]'
    );
    const noneRadio = container.querySelector('[data-qa-dbaas-radio="None"]');
    const enabledButtons = container.querySelectorAll(
      '[aria-disabled="false"]'
    );

    expect(specificRadio).toBeInTheDocument();
    expect(noneRadio).toBeInTheDocument();
    expect(enabledButtons).toHaveLength(3);
  });

  it('Should disable ips', async () => {
    const ips = [{ address: '1.1.1.1/32' }];
    const { container, getAllByText, getAllByTestId } =
      renderWithThemeAndHookFormContext<DatabaseCreateValues>({
        component: <DatabaseCreateAccessControls />,
        useFormOptions: { defaultValues: { allow_list: ips } },
      });

    expect(getAllByText('Manage Access')).toHaveLength(1);
    expect(getAllByTestId('domain-transfer-input')).toHaveLength(1);
    expect(getAllByTestId('button')).toHaveLength(1);

    let enabledButtons = container.querySelectorAll('[aria-disabled="false"]');
    expect(enabledButtons).toHaveLength(1);

    const radioGroup = container.querySelector(
      'cds-radio-group'
    ) as HTMLElement;

    // Trigger the change event that the RadioGroup listens for
    fireEvent(
      radioGroup,
      new CustomEvent('change', {
        detail: { value: 'none' },
        bubbles: true,
      })
    );

    await waitFor(() => {
      enabledButtons = container.querySelectorAll('[aria-disabled="false"]');
      expect(enabledButtons).toHaveLength(0);
    });
  });
});
