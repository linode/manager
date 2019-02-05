import { shallow } from 'enzyme';
import * as React from 'react';

import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb component', () => {
  const wrapper = shallow(
    <Breadcrumb
      linkTo="/linodes"
      linkText="Linodes"
      labelTitle="MyTestLinode"
      classes={{
        root: '',
        backButton: 'backButton',
        linkText: '',
        linkTextWrapper: '',
        labelText: '',
        subtitleLinkText: '',
        prefixComponentWrapper: ''
      }}
    />
  );

  it('contains back icon', () => {
    expect(wrapper.find('WithStyles(IconButton)')).toHaveLength(1);
    expect(
      wrapper.find('WithStyles(IconButton)').hasClass('backButton')
    ).toBeTruthy();
  });

  it('contains link text', () => {
    expect(wrapper.find('[data-qa-link-text]')).toHaveLength(1);
  });

  it('renders labelText without editable props', () => {
    expect(wrapper.find('[data-qa-labeltext]')).toHaveLength(1);
  });

  it('renders a prefixComponent wrapper', () => {
    wrapper.setProps({
      labelOptions: { prefixComponent: <React.Fragment /> }
    });
    expect(wrapper.find('[data-qa-prefixwrapper]')).toHaveLength(1);
  });

  it('renders editable text when given editable props', () => {
    wrapper.setProps({
      onEditHandlers: {
        onEdit: jest.fn(),
        onCancel: jest.fn()
      }
    });
    expect(wrapper.find('[data-qa-label-title]')).toHaveLength(0);
    expect(wrapper.find('[data-qa-editable-text]')).toHaveLength(1);
  });
});
