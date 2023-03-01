import { render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RebuildFromImage } from './RebuildFromImage';

jest.mock('src/utilities/scrollErrorIntoView');
jest.mock('src/components/EnhancedSelect/Select');

const props: CombinedProps = {
  linodeId: 1234,
  userSSHKeys: [],
  passwordHelperText: '',
  requestKeys: jest.fn(),
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
