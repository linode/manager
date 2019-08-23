import { cleanup, render } from '@testing-library/react';
import * as React from 'react';
import { reactRouterProps } from 'src/__data__/reactRouterProps';
import { CombinedProps as Props, VolumesActionMenu } from './VolumesActionMenu';

import { includesActions, wrapWithTheme } from 'src/utilities/testHelpers';

jest.mock('src/components/ActionMenu/ActionMenu');

const props: Props = {
  onAttach: jest.fn(),
  onShowConfig: jest.fn(),
  onClone: jest.fn(),
  onDelete: jest.fn(),
  onDetach: jest.fn(),
  onEdit: jest.fn(),
  onResize: jest.fn(),
  label: '',
  linodeLabel: '',
  attached: false,
  regionID: '',
  size: 50,
  poweredOff: false,
  filesystemPath: '',
  volumeId: 12345,
  volumeTags: ['abc', 'def'],
  volumeLabel: '',
  ...reactRouterProps
};

afterEach(cleanup);

describe('Volume action menu', () => {
  it('should include standard Volume actions', () => {
    const { queryByText } = render(
      wrapWithTheme(<VolumesActionMenu {...props} />)
    );
    includesActions(
      ['Show Configuration', 'Edit Volume', 'Resize', 'Clone'],
      queryByText
    );
  });

  it('should render an Attach action if the volume is not attached', () => {
    const { queryByText } = render(
      wrapWithTheme(<VolumesActionMenu {...props} />)
    );
    expect(queryByText('Attach')).toBeInTheDocument();
    expect(queryByText('Detach')).not.toBeInTheDocument();
  });

  it('should show an Detach action (and not show Attach) if the Volume is already attached', () => {
    const { queryByText } = render(
      wrapWithTheme(<VolumesActionMenu {...props} attached={true} />)
    );
    expect(queryByText('Detach')).toBeInTheDocument();
    expect(queryByText('Attach')).not.toBeInTheDocument();
  });

  it('should show Delete if the Volume is unattached or the Linode to which it is attached is powered off', () => {
    const { queryByText, rerender } = render(
      wrapWithTheme(
        <VolumesActionMenu {...props} attached={false} poweredOff={true} />
      )
    );
    expect(queryByText('Delete')).toBeInTheDocument();
    rerender(
      wrapWithTheme(
        <VolumesActionMenu {...props} attached={true} poweredOff={true} />
      )
    );
    expect(queryByText('Delete')).toBeInTheDocument();
    rerender(
      wrapWithTheme(
        <VolumesActionMenu {...props} attached={true} poweredOff={false} />
      )
    );
    expect(queryByText('Delete')).not.toBeInTheDocument();
  });
});
