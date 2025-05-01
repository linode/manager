import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { useIsDatabasesEnabled } from '../utilities';
import { DatabaseCreateAccessControls } from './DatabaseCreateAccessControls';

import type { IsDatabasesEnabled } from '../utilities';

vi.mock('src/features/Databases/utilities');

describe('DatabaseCreateAccessControls', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('Should render enabled', () => {
    vi.mocked(useIsDatabasesEnabled).mockReturnValue({
      isDatabasesV2GA: true,
    } as IsDatabasesEnabled);

    const ips = [{ address: '' }];
    const { container, getAllByText, getAllByTestId } = renderWithTheme(
      <DatabaseCreateAccessControls
        ips={ips}
        onBlur={() => {}}
        onChange={() => {}}
      />
    );

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
    vi.mocked(useIsDatabasesEnabled).mockReturnValue({
      isDatabasesV2GA: true,
    } as IsDatabasesEnabled);

    const ips = [
      { address: '1.1.1.1/32' },
      { address: '2.2.2.2' },
      { address: '3.3.3.3/128' },
    ];
    const { container, getAllByText, getAllByTestId } = renderWithTheme(
      <DatabaseCreateAccessControls
        ips={ips}
        onBlur={() => {}}
        onChange={() => {}}
      />
    );

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

  it('Should disable ips', () => {
    vi.mocked(useIsDatabasesEnabled).mockReturnValue({
      isDatabasesV2GA: true,
    } as IsDatabasesEnabled);

    const ips = [{ address: '1.1.1.1/32' }];
    const { container, getAllByText, getAllByTestId } = renderWithTheme(
      <DatabaseCreateAccessControls
        ips={ips}
        onBlur={() => {}}
        onChange={() => {}}
      />
    );

    expect(getAllByText('Manage Access')).toHaveLength(1);
    expect(getAllByTestId('domain-transfer-input')).toHaveLength(1);
    expect(getAllByTestId('button')).toHaveLength(1);

    let enabledButtons = container.querySelectorAll('[aria-disabled="false"]');
    expect(enabledButtons).toHaveLength(1);

    const noneRadio = container.querySelector('[data-qa-dbaas-radio="None"]');
    fireEvent.click(noneRadio as Element);

    enabledButtons = container.querySelectorAll('[aria-disabled="false"]');
    expect(enabledButtons).toHaveLength(0);
  });
});
