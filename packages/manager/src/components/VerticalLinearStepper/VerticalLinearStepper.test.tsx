import '@testing-library/jest-dom/extend-expect';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VerticalLinearStepper } from './VerticalLinearStepper';

const steps = [
  {
    content: <div>Step 1 Content</div>,
    handler: jest.fn(), // Mock function for testing
    label: 'Details',
  },
  {
    content: <div>Step 2 Content</div>,
    handler: jest.fn(),
    label: 'Summary',
  },
  {
    content: <div>Step 3 Content</div>,
    handler: jest.fn(),
    label: 'Next',
  },
];

// TODO: Could add more tests as part of feature ticket
describe('VerticalLinearStepper', () => {
  test('Should render initial step content', () => {
    renderWithTheme(<VerticalLinearStepper steps={steps} />);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 2 Content')).toBeNull();
    expect(screen.queryByText('Step 3 Content')).toBeNull();
    expect(screen.getByText('Next: Summary')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Details')).toBeNull();
  });
  test('Should navigate to second step conent', () => {
    renderWithTheme(<VerticalLinearStepper steps={steps} />);
    userEvent.click(screen.getByTestId('summary'));
    expect(steps[0].handler).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Step 2 Content')).toBeInTheDocument();
    expect(screen.queryByText('Step 1 Content')).toBeNull();
    expect(screen.queryByText('Step 3 Content')).toBeNull();
    expect(screen.getByText('Next: Next')).toBeInTheDocument();
    expect(screen.queryByText('Previous: Summary')).toBeNull();
  });
  test('Should navigate to final step conent', () => {
    renderWithTheme(<VerticalLinearStepper steps={steps} />);
    userEvent.click(screen.getByTestId('summary'));
    userEvent.click(screen.getByTestId('next'));
    expect(steps[1].handler).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Step 1 Content')).toBeNull();
    expect(screen.queryByText('Step 2 Content')).toBeNull();
    expect(screen.getByText('Step 3 Content')).toBeInTheDocument();
    expect(screen.queryByText('Next: Summary')).toBeNull();
    expect(screen.getByText('Previous: Summary')).toBeInTheDocument();
  });
  test('Should be able to go previous step', () => {
    renderWithTheme(<VerticalLinearStepper steps={steps} />);
    userEvent.click(screen.getByTestId('summary'));
    userEvent.click(screen.getByText('Previous: Details'));
    expect(steps[1].handler).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Step 1 Content')).toBeInTheDocument();
  });
});
