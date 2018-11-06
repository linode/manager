import { shallow } from 'enzyme';
import * as React from 'react';

import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb component', () => {
  const wrapper = shallow(
    <Breadcrumb
      linkTo="/linodes"
      linkText="Linodes"
      label="MyTestLinode"

      classes={{root: '', backButton: '', linkText: '', staticText: ''}}
    />
  );

  it('renders static text when not given editable props', () => {
    expect(wrapper.find('[data-qa-static-text]')).toHaveLength(1);
    expect(wrapper.find('[data-qa-editable-text]')).toHaveLength(0);
  });

  it('renders editable text when given editable props', () => {
    wrapper.setProps({
      onEdit: jest.fn(),
      onCancel: jest.fn()
    });
    expect(wrapper.find('[data-qa-static-text]')).toHaveLength(0);
    expect(wrapper.find('[data-qa-editable-text]')).toHaveLength(1);
  });

  it('doesn\'t render label link when not given prop', () => {
    expect(wrapper.find('[data-qa-label-link]')).toHaveLength(0);
  });

  it('renders label link when given prop', () => {
    wrapper.setProps({
      labelLink: '/summary',
      onEdit: undefined,
      onCancel: undefined
    });
    expect(wrapper.find('[data-qa-label-link]')).toHaveLength(1);
  });
});