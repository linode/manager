import { cleanup } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import MultipleIPInput, { Props } from './MultipleIPInput';

afterEach(cleanup);

const baseProps: Props = {
  title: 'My Input',
  ips: [],
  onChange: jest.fn()
};

describe('MultipleIPInput', () => {
  it('should render a single input field when ips is an empty array', () => {
    const { queryAllByTestId } = renderWithTheme(
      <MultipleIPInput {...baseProps} />
    );
    expect(queryAllByTestId('domain-transfer-input')).toHaveLength(1);
  });
});
