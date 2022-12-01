import * as React from 'react';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';
import { Props, VolumesActionMenu } from './VolumesActionMenu';

const props: Props = {
  label: '',
  linodeLabel: '',
  linodeId: 0,
  attached: false,
  regionID: '',
  size: 50,
  filesystemPath: '',
  volumeId: 12345,
  volumeTags: ['abc', 'def'],
  volumeLabel: '',
  isVolumesLanding: false,
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  handleAttach: jest.fn(),
  handleDelete: jest.fn(),
  handleDetach: jest.fn(),
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
