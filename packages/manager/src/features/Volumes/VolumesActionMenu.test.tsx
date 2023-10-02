import * as React from 'react';

import { volumeFactory } from 'src/factories';
import { includesActions, renderWithTheme } from 'src/utilities/testHelpers';

import { Props, VolumesActionMenu } from './VolumesActionMenu';

const props: Props = {
  handlers: {
    handleAttach: jest.fn(),
    handleClone: jest.fn(),
    handleDelete: jest.fn(),
    handleDetach: jest.fn(),
    handleDetails: jest.fn(),
    handleEdit: jest.fn(),
    handleResize: jest.fn(),
  },
  isVolumesLanding: true,
  volume: volumeFactory.build({ linode_id: null, linode_label: null }),
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
      <VolumesActionMenu
        {...props}
        volume={volumeFactory.build({
          linode_id: 2,
          linode_label: 'linode-2',
        })}
      />
    );
    includesActions(['Detach'], queryByText);
    expect(queryByText('Attach')).toBeNull();
  });

  it('should include Delete', () => {
    const { queryByText } = renderWithTheme(<VolumesActionMenu {...props} />);
    includesActions(['Delete'], queryByText);
  });
});
