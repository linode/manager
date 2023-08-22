import { fireEvent } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { MultipleSubnetInput } from './MultipleSubnetInput';

const props = {
  onChange: jest.fn(),
  subnets: [
    {
      ip: { ipv4: '', ipv4Error: '' },
      label: 'subnet 1',
      labelError: '',
    },
    {
      ip: { ipv4: '', ipv4Error: '' },
      label: 'subnet 2',
      labelError: '',
    },
    {
      ip: { ipv4: '', ipv4Error: '' },
      label: 'subnet 3',
      labelError: '',
    },
  ],
};

describe('MultipleSubnetInput', () => {
  it('should render a subnet node for each of the given subnets', () => {
    const { getAllByText, getByDisplayValue } = renderWithTheme(
      <MultipleSubnetInput {...props} />
    );

    expect(getAllByText('Subnet label')).toHaveLength(3);
    expect(getAllByText('Subnet IP Address Range')).toHaveLength(3);
    getByDisplayValue('subnet 1');
    getByDisplayValue('subnet 2');
    getByDisplayValue('subnet 3');
  });

  it('should add a subnet to the array when the Add Subnet button is clicked', () => {
    const { getByText } = renderWithTheme(<MultipleSubnetInput {...props} />);
    const addButton = getByText('Add a Subnet');
    fireEvent.click(addButton);
    expect(props.onChange).toHaveBeenCalledWith([
      ...props.subnets,
      {
        ip: { ipv4: '10.0.0.0/24', ipv4Error: '' },
        label: '',
        labelError: '',
      },
    ]);
  });

  it('all inputs after the first should have a close button (X)', () => {
    const { queryAllByTestId } = renderWithTheme(
      <MultipleSubnetInput {...props} />
    );
    expect(queryAllByTestId(/delete-subnet/)).toHaveLength(
      props.subnets.length - 1
    );
  });

  it('should remove an element from the array based on its index when the X is clicked', () => {
    const { getByTestId } = renderWithTheme(<MultipleSubnetInput {...props} />);
    const closeButton = getByTestId('delete-subnet-1');
    fireEvent.click(closeButton);
    expect(props.onChange).toHaveBeenCalledWith([
      {
        ip: { ipv4: '', ipv4Error: '' },
        label: 'subnet 1',
        labelError: '',
      },
      {
        ip: { ipv4: '', ipv4Error: '' },
        label: 'subnet 3',
        labelError: '',
      },
    ]);
  });
});
