import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { EditLoadBalancerLabel } from './EditLoadBalancerLabel';

const initialFormikValues = {
  label: 'Test Label',
};

describe('EditLoadBalancerLabel', () => {
  it('renders without crashing and shows initial label', () => {
    const { getByText } = renderWithThemeAndFormik(<EditLoadBalancerLabel />, {
      initialValues: initialFormikValues,
      onSubmit: vi.fn(),
    });

    expect(getByText('Load Balancer Label')).toBeInTheDocument();
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('toggles edit drawer visibility on button click', () => {
    const { getByRole, getByText, queryByRole } = renderWithThemeAndFormik(
      <EditLoadBalancerLabel />,
      {
        initialValues: initialFormikValues,
        onSubmit: vi.fn(),
      }
    );

    const editButton = getByText('Edit');
    fireEvent.click(editButton);

    // Check if drawer opens
    expect(queryByRole('dialog')).toBeInTheDocument();

    // Check drawer heading.
    expect(
      getByRole('heading', { name: 'Edit Load Balancer Label' })
    ).toBeInTheDocument();

    // check input fields in the drawer.
    expect(
      getByRole('textbox', { name: 'Load Balancer Label' })
    ).toBeInTheDocument();

    fireEvent.click(getByRole('button', { name: 'Cancel' }));

    // Check if drawer closes
    expect(queryByRole('dialog')).toBeNull();
  });

  it('updates label value in drawer and reflects changes', () => {
    const { getByRole, getByText } = renderWithThemeAndFormik(
      <EditLoadBalancerLabel />,
      {
        initialValues: initialFormikValues,
        onSubmit: vi.fn(),
      }
    );

    fireEvent.click(getByText('Edit'));

    const input = getByRole('textbox', { name: 'Load Balancer Label' });
    fireEvent.change(input, { target: { value: 'New Label' } });

    // Close the drawer and check if the new label is reflected
    fireEvent.click(getByRole('button', { name: 'Save Changes' }));
    expect(getByText('New Label')).toBeInTheDocument();
  });

  it('updates label to check error handling', () => {
    const { getByRole, getByText } = renderWithThemeAndFormik(
      <EditLoadBalancerLabel />,
      {
        initialErrors: { label: 'This is an error' },
        initialTouched: { label: true },
        initialValues: initialFormikValues,
        onSubmit: vi.fn(),
      }
    );

    fireEvent.click(getByText('Edit'));

    const input = getByRole('textbox', { name: 'Load Balancer Label' });
    fireEvent.change(input, { target: { value: '' } });

    // Close the drawer and check if the new label is reflected
    fireEvent.click(getByRole('button', { name: 'Save Changes' }));
    expect(getByText('This is an error')).toBeInTheDocument();
  });
});
