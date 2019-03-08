import { shallow } from 'enzyme';
import * as React from 'react';
import { ObjectStorageDrawer, Props } from './ObjectStorageDrawer';

describe('ObjectStorageDrawer', () => {
  const props = {
    classes: { root: '' },
    open: true,
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    label: 'test-label',
    updateLabel: jest.fn(),
    isLoading: false
  };
  const wrapper = shallow<Props>(<ObjectStorageDrawer {...props} />);
  it('renders without crashing', () => {
    expect(wrapper).toHaveLength(1);
  });
  it('calls onSubmit when the submit button is clicked', () => {
    const submitButton = wrapper.find('[data-qa-submit]');
    submitButton.simulate('click');
    expect(props.onSubmit).toHaveBeenCalled();
  });
  it('calls onClose when the cancel button is clicked', () => {
    const submitButton = wrapper.find('[data-qa-cancel]');
    submitButton.simulate('click');
    expect(props.onClose).toHaveBeenCalled();
  });
  it('does not display errors if none are supplied', () => {
    expect(wrapper.find('[data-qa-error]')).toHaveLength(0);
  });
  it('displays errors if they are supplied', () => {
    wrapper.setProps({
      errors: [{ field: 'none', reason: 'An error occurred.' }]
    });
    expect(wrapper.find('[data-qa-error]')).toHaveLength(1);
    expect(wrapper.find('[data-qa-error]').prop('text')).toBe(
      'An error occurred.'
    );
  });
  it('can display multiple errors', () => {
    wrapper.setProps({
      errors: [
        { field: 'none', reason: 'An error occurred.' },
        { field: 'label', reason: 'Another error occurred.' }
      ]
    });
    expect(wrapper.find('[data-qa-error]')).toHaveLength(2);
    expect(
      wrapper
        .find('[data-qa-error]')
        .at(0)
        .prop('text')
    ).toBe('An error occurred.');
    expect(
      wrapper
        .find('[data-qa-error]')
        .at(1)
        .prop('text')
    ).toBe('Another error occurred.');
  });
});
