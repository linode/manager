import { vi } from 'vitest';
import * as React from 'react';

import { StackScriptForm } from './StackScriptForm';
import { renderWithTheme } from 'src/utilities/testHelpers';

const props = {
  images: {
    available: [],
    selected: [],
  },
  currentUser: 'mmckenna',
  label: {
    value: '',
    handler: vi.fn(),
  },
  description: {
    value: '',
    handler: vi.fn(),
  },
  revision: {
    value: '',
    handler: vi.fn(),
  },
  script: {
    value: '',
    handler: vi.fn(),
  },
  onSelectChange: vi.fn(),
  errors: [],
  onSubmit: vi.fn(),
  onCancel: vi.fn(),
  isSubmitting: false,
  mode: 'create' as any,
  disableSubmit: false,
};

describe('StackScriptCreate', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<StackScriptForm {...props} />);
    getByText(/stackscript label/i);
  });
});
