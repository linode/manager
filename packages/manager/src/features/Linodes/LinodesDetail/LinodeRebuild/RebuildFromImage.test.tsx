import { render } from '@testing-library/react';
import * as React from 'react';

import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { wrapWithTheme } from 'src/utilities/testHelpers';

import { RebuildFromImage } from './RebuildFromImage';

vi.mock('src/utilities/scrollErrorIntoView');
vi.mock('src/components/EnhancedSelect/Select');

const props = {
  disabled: false,
  diskEncryptionEnabled: true,
  handleRebuildError: vi.fn(),
  isLKELinode: false,
  linodeId: 1234,
  linodeIsInDistributedRegion: false,
  onClose: vi.fn(),
  passwordHelperText: '',
  toggleDiskEncryptionEnabled: vi.fn(),
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
