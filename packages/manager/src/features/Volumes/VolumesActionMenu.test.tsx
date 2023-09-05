import * as React from 'react';

import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import { Props, VolumesActionMenu } from './VolumesActionMenu';

const props: Props = {
  attached: false,
  filesystemPath: '',
  handleAttach: jest.fn(),
  handleDelete: jest.fn(),
  handleDetach: jest.fn(),
  isVolumesLanding: false,
  label: '',
  linodeId: 0,
  linodeLabel: '',
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  regionID: '',
  size: 50,
  volumeId: 12345,
  volumeLabel: '',
  volumeRegion: 'east-us',
  volumeTags: ['abc', 'def'],
};

describe('Volume action menu', () => {
  it('should include basic Volume actions', () => {
    const { queryByText } = renderWithTheme(<VolumesActionMenu {...props} />);
    includesActions(['Show Config', 'Edit'], queryByText);
  });

  it('should include Attach if the Volume is not attached', () => {
    const { queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} isVolumesLanding={true} />
    );
    includesActions(['Attach'], queryByText);
    expect(queryByText('Detach')).toBeNull();
  });

  it('should include Detach if the Volume is attached', () => {
    const { queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} attached={true} />
    );
    includesActions(['Detach'], queryByText);
    expect(queryByText('Attach')).toBeNull();
  });

  it('should include Delete', () => {
    const { queryByText } = renderWithTheme(
      <VolumesActionMenu {...props} attached={false} />
    );
    includesActions(['Delete'], queryByText);
  });
});
