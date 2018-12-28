import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import { LabelProps, WithLabelGenerator } from './withLabelGenerator';

const withLabels = WithLabelGenerator({});
const RawComponent = withLabels(React.Component);

describe('withLabelGenerator HOC', () => {
  let wrapper: ShallowWrapper<LabelProps>
  beforeEach(() => {
    wrapper = shallow(<RawComponent />);
  });

  it('returns label', () => {
    expect(wrapper.props().getLabel()).toBe('');
  });

  it('updates custom label', () => {
    wrapper.props().updateCustomLabel({ target: { value: '' } });
    expect(wrapper.props().customLabel).toBe('');
    wrapper.props().updateCustomLabel({ target: { value: 'hello world' } });
    expect(wrapper.props().customLabel).toBe('hello world');
  });

  it('returns custom label after custom label has been altered', () => {
    expect(wrapper.props().getLabel('ubuntu')).toBe('ubuntu');
    wrapper.props().updateCustomLabel({ target: { value: 'hello world' } });
    expect(wrapper.props().getLabel('ubuntu')).toBe('hello world');
  });

  it('returns custom label if not given args', () => {
    expect(wrapper.props().getLabel()).toBe('');
  });

});