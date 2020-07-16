import { cleanup } from '@testing-library/react';
import * as React from 'react';

import { StackScriptForm } from './StackScriptForm';

import { images } from 'src/__data__/images';
import { renderWithTheme } from 'src/utilities/testHelpers';

afterEach(cleanup);

const props = {
  images: {
    available: images,
    selected: []
  },
  currentUser: 'mmckenna',
  label: {
    value: '',
    handler: jest.fn()
  },
  description: {
    value: '',
    handler: jest.fn()
  },
  revision: {
    value: '',
    handler: jest.fn()
  },
  script: {
    value: '',
    handler: jest.fn()
  },
  onSelectChange: jest.fn(),
  errors: [],
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  isSubmitting: false,
  mode: 'create' as any,
  disableSubmit: false
};

describe('StackScriptCreate', () => {
  it('should render', () => {
    const { getByText } = renderWithTheme(<StackScriptForm {...props} />);
    getByText(/stackscript label/i);
  });
});
