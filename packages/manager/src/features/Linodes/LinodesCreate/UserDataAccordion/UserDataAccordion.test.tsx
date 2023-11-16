import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserDataAccordion } from './UserDataAccordion';

describe('UserDataAccordion', () => {
  const onChange = vi.fn();
  const props = {
    createType: 'fromImage',
    onChange,
    userData: 'test data',
  } as const;

  it('should render without errors', () => {
    const { container } = renderWithTheme(<UserDataAccordion {...props} />);
    expect(container).toBeInTheDocument();
  });

  it('should call onChange when text is entered into the input', () => {
    const { getByLabelText } = renderWithTheme(
      <UserDataAccordion {...props} />
    );
    const input = getByLabelText('User Data');
    fireEvent.change(input, { target: { value: 'new test data' } });
    expect(onChange).toHaveBeenCalledWith('new test data');
  });

  it('should display a warning message if the user data is not in an accepted format', () => {
    const onChange = vi.fn();
    const inputValue = '#test-string';
    const { getByLabelText, getByText } = renderWithTheme(
      <UserDataAccordion {...props} onChange={onChange} />
    );

    const input = getByLabelText('User Data');
    fireEvent.change(input, { target: { value: inputValue } });
    fireEvent.blur(input); // triggers format check

    expect(onChange).toHaveBeenCalledWith(inputValue);
    expect(
      getByText('The user data may be formatted incorrectly.')
    ).toBeInTheDocument();
  });

  it('should display a custom header warning message', () => {
    renderWithTheme(<UserDataAccordion {...props} createType="fromBackup" />);

    const headerWarningMessage = screen.getByText(
      'Existing user data is not accessible when creating a Linode from a backup. You may add new user data now.'
    );

    expect(headerWarningMessage).toBeInTheDocument();
  });

  it('should display a custom notice', () => {
    renderWithTheme(
      <UserDataAccordion {...props} renderNotice={<div>Custom notice</div>} />
    );

    const customNotice = screen.getByText('Custom notice');

    expect(customNotice).toBeInTheDocument();
  });

  it('should NOT have a notice when a renderNotice prop is not passed in', () => {
    const { queryByTestId } = renderWithTheme(
      <UserDataAccordion onChange={() => null} userData={''} />
    );

    expect(queryByTestId('render-notice')).toBeNull();
  });
});
