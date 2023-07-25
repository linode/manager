import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptForm } from './StackScriptForm';

const props = {
  currentUser: 'mmckenna',
  description: {
    handler: jest.fn(),
    value: '',
  },
  disableSubmit: false,
  errors: [],
  images: {
    available: [],
    selected: [],
  },
  isSubmitting: false,
  label: {
    handler: jest.fn(),
    value: '',
  },
  mode: 'create' as any,
  onCancel: jest.fn(),
  onSelectChange: jest.fn(),
  onSubmit: jest.fn(),
  revision: {
    handler: jest.fn(),
    value: '',
  },
  script: {
    handler: jest.fn(),
    value: '',
  },
};

describe('StackScriptCreate', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<StackScriptForm {...props} />);
    getByText(/stackscript label/i);
  });
});
