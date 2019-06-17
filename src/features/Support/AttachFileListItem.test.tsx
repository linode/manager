import { shallow } from 'enzyme';
import * as React from 'react';

import {
  attachment1,
  attachment2,
  attachment3
} from 'src/__data__/fileAttachments';

import { AttachFileListItem } from './AttachFileListItem';

const props = {
  inlineDisplay: false,
  file: attachment1,
  fileIdx: 1,
  removeFile: jest.fn(),
  onClick: jest.fn(),
  classes: {
    root: '',
    attachmentField: '',
    attachmentsContainer: '',
    closeIcon: '',
    uploadProgress: ''
  }
};

const component = shallow(<AttachFileListItem {...props} />);

describe('AttachFileListItem component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should render a button when inlineDisplay is false', () => {
    expect(component.find('[data-qa-delete-button]')).toHaveLength(1);
  });
  it('should render a delete icon when inlineDisplay is true', () => {
    component.setProps({ inlineDisplay: true });
    const textfield = component
      .find('WithStyles(LinodeTextField)')
      .first() as any;
    expect(textfield.props().InputProps).toBeDefined();
    expect(component.find('[data-qa-delte-button]')).toHaveLength(0);
  });
  it('should call the removeFile method when the delete button is clicked', () => {
    component.setProps({ inlineDisplay: false });
    const button = component.find('[data-qa-delete-button]').first();
    button.simulate('click');
    expect(props.onClick).toHaveBeenCalled();
  });
  it('should render a progress bar when a file is uploading', () => {
    component.setProps({ file: attachment2 });
    expect(component.find('LinearProgressComponent')).toHaveLength(
      1
    );
  });
  it('should return null if the file has already been uploaded', () => {
    component.setProps({ file: attachment3 });
    expect(component.getElement()).toBeNull();
  });
});
