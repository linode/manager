import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import MultipleIPInput, { Props } from './MultipleIPInput';

const baseProps: Props = {
  title: 'My Input',
  ips: [{ address: 'ip1' }, { address: 'ip2' }, { address: 'ip3' }],
  onChange: jest.fn()
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
      { address: '' }
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
      { address: 'ip3' }
    ]);
  });
});
