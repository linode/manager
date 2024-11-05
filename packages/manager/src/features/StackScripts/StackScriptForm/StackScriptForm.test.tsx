import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { StackScriptForm } from './StackScriptForm';

const props = {
  currentUser: 'mmckenna',
  description: {
    handler: vi.fn(),
    value: '',
  },
  disableSubmit: false,
  errors: [],
  isSubmitting: false,
  label: {
    handler: vi.fn(),
    value: '',
  },
  mode: 'create' as any,
  onCancel: vi.fn(),
  onSelectChange: vi.fn(),
  onSubmit: vi.fn(),
  revision: {
    handler: vi.fn(),
    value: '',
  },
  script: {
    handler: vi.fn(),
    value: '',
  },
  selectedImages: [],
};

describe('StackScriptCreate', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<StackScriptForm {...props} />);
    getByText(/stackscript label/i);
  });
});
