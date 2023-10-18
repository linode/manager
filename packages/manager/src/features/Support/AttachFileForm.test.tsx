import { shallow } from 'enzyme';
import * as React from 'react';

import { attachment1, attachment2 } from 'src/__data__/fileAttachments';

import { AttachFileForm } from './AttachFileForm';

const props = {
  classes: {
    attachFileButton: '',
  },
  files: [attachment1, attachment2],
  handleFileSelected: vi.fn(),
  updateFiles: vi.fn(),
};

const component = shallow(<AttachFileForm {...props} />);

describe('AttachFileForm component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  // @todo test event handlers
  // @todo test loading/error/empty states
});
