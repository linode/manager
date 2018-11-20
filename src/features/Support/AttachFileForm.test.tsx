import { shallow } from 'enzyme';
import * as React from 'react';

import { AttachFileForm } from './AttachFileForm';

const attachment1 =  {
  name: 'file1',
  file: new File(['name'], 'file1'),
  uploading: false,
  uploaded: false,
}

const attachment2 =  {
  name: 'file2',
  file: new File(['name'], 'file2'),
  uploading: false,
  uploaded: false,
}

const props = {
  files: [attachment1, attachment2],
  handleFileSelected: jest.fn(),
  updateFiles: jest.fn(),
  inlineDisplay: true,
  classes: { root: '',
    attachFileButton: '',
    attachmentsContainer: '',
    attachmentField: '',
    uploadProgress: '',
  }
}

const component = shallow(<AttachFileForm {...props} />);

describe("AttachFileForm component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  // @todo test event handlers
  // @todo test loading/error/empty states
});