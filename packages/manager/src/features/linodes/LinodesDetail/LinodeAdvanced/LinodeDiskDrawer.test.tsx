import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodeDiskDrawer, modes } from './LinodeDiskDrawer';

const classes = {
  root: '',
  section: '',
  divider: ''
};
const props = {
  classes,
  mode: 'create' as any,
  selectedMode: modes.EMPTY,
  maximumSize: 100,
  open: true,
  submitting: false,
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  onLabelChange: jest.fn(),
  onImageChange: jest.fn(),
  onFilesystemChange: jest.fn(),
  onSizeChange: jest.fn(),
  onPasswordChange: jest.fn(),
  onResetImageMode: jest.fn(),
  label: 'This drawer',
  filesystem: 'ext4',
  size: 50
};

const component = shallow(<LinodeDiskDrawer {...props} />);

describe('Component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should display the mode toggle when creating', () => {
    expect(component.find('[data-qa-mode-toggle]')).toHaveLength(1);
  });
  it('should not display the mode toggle when resizing', () => {
    component.setProps({ mode: 'resize' as any });
    expect(component.find('[data-qa-mode-toggle]')).toHaveLength(0);
  });
  it('should not display the mode toggle when renaming', () => {
    component.setProps({ mode: 'rename' as any });
    expect(component.find('[data-qa-mode-toggle]')).toHaveLength(0);
  });
  it('should call the submit handler when Submit is clicked', () => {
    component.find('[data-qa-disk-submit]').simulate('click');
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });
  it('should call the cancel handler when Cancel is clicked', () => {
    component.find('[data-qa-disk-cancel]').simulate('click');
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
