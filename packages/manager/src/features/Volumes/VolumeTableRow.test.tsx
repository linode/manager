import { VolumeStatus } from '@linode/api-v4/lib/volumes';
import * as React from 'react';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import { volumes } from 'src/__data__/volumes';
import { VolumeTableRow, CombinedProps } from './VolumeTableRow';

const volumeWithLinodeLabel = {
  ...volumes[2],
  linodeLabel: 'thisLinode',
};

const unattachedVolume = {
  ...volumes[0],
  linodeLabel: '',
  linode_id: null,
  linode_label: null,
  linodeStatus: 'active',
};

const props: CombinedProps = {
  id: 0,
  label: volumeWithLinodeLabel.linodeLabel,
  region: '',
  size: 0,
  status: 'active' as VolumeStatus,
  tags: [],
  created: '',
  updated: '',
  filesystem_path: '',
  hardware_type: 'hdd',
  linode_id: 0,
  linode_label: 'linode-0',
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  handleAttach: jest.fn(),
  handleDetach: jest.fn(),
  handleDelete: jest.fn(),
};

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...props} />)
    );
    expect(getByText(volumeWithLinodeLabel.linodeLabel));
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const unattachedProps = { ...props, volume: unattachedVolume };
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<VolumeTableRow {...unattachedProps} />)
    );
    expect(getByText('Detach'));
  });
});
