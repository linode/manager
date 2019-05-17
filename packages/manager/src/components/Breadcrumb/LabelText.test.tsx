import { shallow } from 'enzyme';
import * as React from 'react';

import { LabelText } from './LabelText';

describe('LabelText component', () => {
  const wrapper = shallow(
    <LabelText
      title="My Title"
      classes={{
        root: '',
        labelTitle: '',
        labelSubtitle: '',
        underlineOnHover: ''
      }}
    />
  );

  it('renders title', () => {
    expect(wrapper.find('[data-qa-label-title]')).toHaveLength(1);
    expect(
      wrapper
        .find('[data-qa-label-title]')
        .children()
        .text()
    ).toBe('My Title');
    expect(
      wrapper
        .find('[data-qa-label-title]')
        .children()
        .text()
    ).toBe('My Title');
  });

  it('renders subtitle', () => {
    expect(wrapper.find('[data-qa-label-subtitle]')).toHaveLength(0);
    wrapper.setProps({
      subtitle: 'My Subtitle'
    });
    expect(wrapper.find('[data-qa-label-title]')).toHaveLength(1);
    expect(
      wrapper
        .find('[data-qa-label-title]')
        .children()
        .text()
    ).toBe('My Title');
    expect(wrapper.find('[data-qa-label-subtitle]')).toHaveLength(1);
    expect(
      wrapper
        .find('[data-qa-label-subtitle]')
        .children()
        .text()
    ).toBe('My Subtitle');
  });

  it('wraps a link around title when given prop', () => {
    wrapper.setProps({
      titleLink: '/summary'
    });
    expect(wrapper.find('[data-qa-label-link]')).toHaveLength(1);
  });
});
