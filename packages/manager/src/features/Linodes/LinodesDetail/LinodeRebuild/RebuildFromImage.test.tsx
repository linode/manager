import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { RebuildFromImage } from './RebuildFromImage';

jest.mock('src/utilities/scrollErrorIntoView');
jest.mock('src/components/EnhancedSelect/Select');

const props = {
  linodeId: 1234,
  passwordHelperText: '',
  disabled: false,
  handleRebuildError: jest.fn(),
  onClose: jest.fn(),
  ...reactRouterProps,
};

describe('RebuildFromImage', () => {
  it('renders a SelectImage panel', () => {
    const { queryByText } = render(
      wrapWithTheme(<RebuildFromImage {...props} />)
    );
    expect(queryByText('Select Image')).toBeInTheDocument();
  });
});
