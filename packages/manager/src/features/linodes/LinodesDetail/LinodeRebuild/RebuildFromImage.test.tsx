import { vi } from 'vitest';
import { render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { CombinedProps, RebuildFromImage } from './RebuildFromImage';

vi.mock('src/utilities/scrollErrorIntoView');
vi.mock('src/components/EnhancedSelect/Select');

const props: CombinedProps = {
  linodeId: 1234,
  userSSHKeys: [],
  passwordHelperText: '',
  requestKeys: vi.fn(),
  disabled: false,
  handleRebuildError: vi.fn(),
  onClose: vi.fn(),
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
