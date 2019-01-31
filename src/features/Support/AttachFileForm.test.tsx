import { shallow } from 'enzyme';
import * as React from 'react';

import { AttachFileForm } from './AttachFileForm';

import { attachment1, attachment2 } from 'src/__data__/fileAttachments';

const props = {
  files: [attachment1, attachment2],
  handleFileSelected: jest.fn(),
  updateFiles: jest.fn(),
  inlineDisplay: true,
  classes: {
    root: '',
    attachFileButton: '',
    attachmentsContainer: '',
    attachmentField: '',
    uploadProgress: ''
  }
};

const component = shallow(<AttachFileForm {...props} />);

describe('AttachFileForm component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  // @todo test event handlers
  // @todo test loading/error/empty states
});
