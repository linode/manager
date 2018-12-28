import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import store from 'src/store';
import { dedupeLabel, LabelProps, pad, withLabelGenerator } from './withLabelGenerator';

const RawComponent = withLabelGenerator(() => <div/>);

describe('withLabelGenerator HOC', () => {
  let wrapper: ShallowWrapper<LabelProps, {}>;
  let nestedComponent: ShallowWrapper<LabelProps, {}>;
  beforeEach(() => {
    wrapper = shallow(<RawComponent />, { context: { store } });
    nestedComponent = wrapper.dive()

  });

  it('returns label', () => {
    expect(nestedComponent.props().getLabel()).toBe('');
  });

  it('updates custom label', () => {
    nestedComponent.props().updateCustomLabel({ target: { value: '' } });
    expect(nestedComponent.props().customLabel).toBe('');
    nestedComponent.props().updateCustomLabel({ target: { value: 'hello world' } });
    expect(nestedComponent.props().customLabel).toBe('hello world');
  });

  it('returns custom label after custom label has been altered', () => {
    expect(nestedComponent.props().getLabel('ubuntu')).toBe('ubuntu');
    nestedComponent.props().updateCustomLabel({ target: { value: 'hello world' } });
    expect(nestedComponent.props().getLabel('ubuntu')).toBe('hello world');
  });

  it('returns custom label if not given args', () => {
    expect(nestedComponent.props().getLabel()).toBe('');
  });
});

describe('pad', () => {
  it('pads with the specified character', () => {
    expect(pad(9, 3)).toBe('009')
    expect(pad(9, 3, '+')).toBe('++9')
    expect(pad(9, 2)).toBe('09')
    expect(pad(9, 1)).toBe('9')
    expect(pad(19, 5)).toBe('00019')
  })
});

describe('dedupe label', () => {
  it('adds an incrementor', () => {
    expect(dedupeLabel('my-label', ['my-label'])).toBe('my-label001');
    expect(dedupeLabel('my-label', ['my-label001'])).toBe('my-label');
    expect(dedupeLabel('my-label', ['my-label', 'my-label-002'])).toBe('my-label001');
    expect(dedupeLabel('my-label', ['my-label', 'my-label001', 'my-label003'])).toBe('my-label002');
  });
})