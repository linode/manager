import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MultipleIPInput } from './MultipleIPInput';

const baseProps = {
  ips: [{ address: 'ip1' }, { address: 'ip2' }, { address: 'ip3' }],
  onChange: vi.fn(),
  title: 'My Input',
};

describe('MultipleIPInput', () => {
  it('should render an input field for each string in ips', () => {
    const { getByDisplayValue, queryAllByTestId } = renderWithTheme(
      <MultipleIPInput {...baseProps} />
    );
    expect(queryAllByTestId('domain-transfer-input')).toHaveLength(3);
    getByDisplayValue('ip1');
    getByDisplayValue('ip2');
    getByDisplayValue('ip3');
  });

  it('should add an empty ip to the array when the Add IP button is clicked', () => {
    const { getByText } = renderWithTheme(<MultipleIPInput {...baseProps} />);
    const addButton = getByText(/add/i);
    fireEvent.click(addButton);
    expect(baseProps.onChange).toHaveBeenCalledWith([
      { address: 'ip1' },
      { address: 'ip2' },
      { address: 'ip3' },
      { address: '' },
    ]);
  });

  it('all inputs after the first should have a close button (X)', () => {
    const { queryAllByTestId } = renderWithTheme(
      <MultipleIPInput {...baseProps} />
    );
    expect(queryAllByTestId(/delete-ip/)).toHaveLength(
      baseProps.ips.length - 1
    );
  });

  it('should remove an element from the array based on its index when the X is clicked', () => {
    const { getByTestId } = renderWithTheme(<MultipleIPInput {...baseProps} />);
    const closeButton = getByTestId('delete-ip-1');
    fireEvent.click(closeButton);
    expect(baseProps.onChange).toHaveBeenCalledWith([
      { address: 'ip1' },
      { address: 'ip3' },
    ]);
  });

  it('should enable all actions by default', async () => {
    const props = {
      ...baseProps,
      ips: [{ address: 'ip1' }, { address: 'ip2' }],
    };
    const { getByTestId, getByLabelText, getByText } = renderWithTheme(
      <MultipleIPInput {...props} />
    );
    const ip0 = getByLabelText('domain-transfer-ip-0');
    const ip1 = getByLabelText('domain-transfer-ip-1');
    const closeButton = getByTestId('delete-ip-1').closest('button');
    const addButton = getByText('Add an IP').closest('button');

    expect(ip0).toBeEnabled();
    expect(ip1).toBeEnabled();
    expect(closeButton).toBeEnabled();
    expect(addButton).toBeEnabled();
  });

  it('should disable all actions', async () => {
    const props = {
      ...baseProps,
      disabled: true,
      ips: [{ address: 'ip1' }, { address: 'ip2' }],
    };
    const { getByTestId, getByLabelText, getByText } = renderWithTheme(
      <MultipleIPInput {...props} />
    );
    const ip0 = getByLabelText('domain-transfer-ip-0');
    const ip1 = getByLabelText('domain-transfer-ip-1');
    const closeButton = getByTestId('delete-ip-1').closest('button');
    const addButton = getByText('Add an IP').closest('button');

    expect(ip0).toBeDisabled();
    expect(ip1).toBeDisabled();
    expect(closeButton).toBeDisabled();
    expect(addButton).toBeDisabled();
  });
});
