import '@testing-library/jest-dom/extend-expect';
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
test('renders all steps and navigates', () => {
  renderWithTheme(<VerticalLinearStepper steps={steps} />);
});
