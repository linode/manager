import { VolumeStatus } from '@linode/api-v4/lib/volumes';
import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
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
  label: 'test',
  region: 'test2',
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

// const component = shallow(<VolumeTableRow {...props} />);

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    // expect(
    //   component
    //     .find('[data-qa-volume-cell-attachment]')
    //     .contains(volumeWithLinodeLabel.linodeLabel)
    // ).toBeTruthy();

    const { getByText } = render(wrapWithTheme(<VolumeTableRow {...props} />));
    expect(getByText(volumeWithLinodeLabel.linodeLabel));
  });

  // it('should show Unattached if the Volume is not attached to a Linode', () => {
  //   const unattachedProps = { ...props, volume: unattachedVolume };
  //   const { getByText } = render(
  //     wrapWithTheme(<VolumeTableRow {...unattachedProps} />)
  //   );
  //   expect(getByText('Unattached'));
  // });
});
