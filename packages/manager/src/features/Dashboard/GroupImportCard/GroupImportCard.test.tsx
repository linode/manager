import { shallow } from 'enzyme';
import * as React from 'react';
import { GroupImportCard } from './GroupImportCard';

describe('GroupImportCard', () => {
  const mockFn = jest.fn();
  const dismiss = jest.fn();
  const hide = jest.fn();
  const wrapper = shallow(
    <GroupImportCard
      theme="someThemeName"
      classes={{
        root: '',
        section: '',
        title: '',
        button: '',
        icon: ''
      }}
      openImportDrawer={mockFn}
      dismiss={dismiss}
      hide={hide}
      hidden={false}
    />
  );

  it('renders without crashing', () => {
    expect(wrapper.find('WithStyles(DashboardCard)')).toHaveLength(1);
  });

  it('renders a header', () => {
    const header = wrapper.find('[data-qa-group-cta-header]');
    expect(header).toHaveLength(1);
    expect(header.children().text()).toBe('Import Display Groups as Tags');
  });

  it('renders body text', () => {
    const body = wrapper.find('[data-qa-group-cta-body]');
    expect(body).toHaveLength(1);
  });

  it('renders a button', () => {
    expect(wrapper.find('WithStyles(wrappedButton)')).toHaveLength(1);
  });

  it('executes function on button click', () => {
    wrapper.find('WithStyles(wrappedButton)').simulate('click');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
  it('calls hide and dismiss when the close button is clicked', () => {
    wrapper
      .find('[data-qa-dismiss-cta]')
      .simulate('click', { preventDefault: jest.fn() });
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(hide).toHaveBeenCalledTimes(1);
  });
});
