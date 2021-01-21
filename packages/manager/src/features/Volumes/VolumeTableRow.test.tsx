import { VolumeStatus } from '@linode/api-v4/lib/volumes';
import { render } from '@testing-library/react';
import * as React from 'react';
import { wrapWithTheme } from 'src/utilities/testHelpers';
import { volumes } from 'src/__data__/volumes';
import { VolumeTableRow } from './VolumeTableRow';

// jest.mock('useLocation', () => ({ pathname: 'volumes' }));

const volumeWithLinodeLabel = {
  ...volumes[2],
  linodeLabel: 'thisLinode'
};

const unattachedVolume = {
  ...volumes[0],
  linodeLabel: '',
  linode_id: null,
  linodeStatus: 'active'
};

const props = {
  id: 0,
  label: volumeWithLinodeLabel.linodeLabel,
  region: '',
  size: 0,
  status: 'active' as VolumeStatus,
  tags: [],
  created: '',
  updated: '',
  filesystem_path: '',
  linode_id: 0,
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

describe('Volume table row', () => {
  it("should show the attached Linode's label if present", () => {
    const { getByText } = render(wrapWithTheme(<VolumeTableRow {...props} />));
    expect(getByText(volumeWithLinodeLabel.linodeLabel));
  });

  it('should show Unattached if the Volume is not attached to a Linode', () => {
    const unattachedProps = { ...props, volume: unattachedVolume };
    const { getByText } = render(
      wrapWithTheme(<VolumeTableRow {...unattachedProps} />)
    );
    expect(getByText('Detach'));
  });
});
