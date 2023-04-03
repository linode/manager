import * as React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'src/utilities/testHelpers';
import UserDataAccordion from './UserDataAccordion';
import { LINODE_CREATE_FROM } from './UserDataAccordionHeading';

describe('UserDataAccordion', () => {
  const onChange = jest.fn();
  const props = {
    userData: 'test data',
    onChange,
    createType: '',
  };
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
    const onChange = jest.fn();
    const inputValue = '#test-string';
    const { getByLabelText, getByText } = renderWithTheme(
      <UserDataAccordion {...props} onChange={onChange} />
    );

    const input = getByLabelText('User Data');
    fireEvent.change(input, { target: { value: inputValue } });
    fireEvent.blur(input); // triggers format check

    expect(onChange).toHaveBeenCalledWith(inputValue);
    expect(
      getByText('This user data may not be in a format accepted by cloud-init.')
    ).toBeInTheDocument();
  });

  it('should display a custom header warning message', () => {
    renderWithTheme(
      <UserDataAccordion {...props} createType={LINODE_CREATE_FROM.BACKUPS} />
    );

    const headerWarningMessage = screen.getByText(
      'Existing user data is not available when creating a Linode from a backup.'
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
      <UserDataAccordion userData={''} onChange={() => null} />
    );

    expect(queryByTestId('render-notice')).toBeNull();
  });
});
