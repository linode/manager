import { VolumeStatus } from '@linode/api-v4/lib/volumes';
import { shallow } from 'enzyme';
import * as React from 'react';
import { volumes } from 'src/__data__/volumes';
import { VolumeTableRow } from './VolumeTableRow';

const volumeWithLinodeLabel = {
  ...volumes[2],
  linodeLabel: 'thisLinode'
};

const unattachedVolume = {
  ...volumes[0],
  linodeLabel: '',
  linodeStatus: 'active'
};

const classes = {
  root: '',
  title: '',
  labelCol: '',
  labelStatusWrapper: '',
  attachmentCol: '',
  sizeCol: '',
  pathCol: '',
  volumesWrapper: '',
  linodeVolumesWrapper: '',
  systemPath: ''
};

const props = {
  classes,
  volume: volumeWithLinodeLabel,
  id: 0,
  label: '',
  region: '',
  size: 0,
  status: 'active' as VolumeStatus,
  tags: [],
  created: '',
  updated: '',
  filesystem_path: '',
  linode_id: null,
  isUpdating: false,
  isVolumesLanding: true,
  openForEdit: jest.fn(),
  openForResize: jest.fn(),
  openForClone: jest.fn(),
  openForConfig: jest.fn(),
  handleAttach: jest.fn(),
  handleDetach: jest.fn(),
  handleDelete: jest.fn()
};

const component = shallow(<VolumeTableRow {...props} />);

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    expect(
      component
        .find('[data-qa-volume-cell-attachment]')
        .contains(volumeWithLinodeLabel.linodeLabel)
    ).toBeTruthy();
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const unattachedProps = { ...props, volume: unattachedVolume };
    const unattached = shallow(<VolumeTableRow {...unattachedProps} />);
    expect(
      unattached.find('[data-qa-volume-cell-attachment]').contains('Unattached')
    ).toBeTruthy();
  });
});
