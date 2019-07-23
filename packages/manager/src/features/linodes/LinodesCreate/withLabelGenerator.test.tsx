import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import store from 'src/store';
import {
  dedupeLabel,
  LabelProps,
  withLabelGenerator
} from './withLabelGenerator';

const RawComponent = withLabelGenerator(() => <div />);

describe('withLabelGenerator HOC', () => {
  let wrapper: ShallowWrapper<LabelProps, {}>;
  let nestedComponent: ShallowWrapper<LabelProps, {}>;
  beforeEach(() => {
    wrapper = shallow(<RawComponent />, { context: { store } });
    nestedComponent = wrapper.dive();
  });

  it('returns label', () => {
    expect(nestedComponent.props().getLabel()).toBe('');
  });

  it('updates custom label', () => {
    nestedComponent
      .props()
      .updateCustomLabel({ target: { value: '' } } as React.ChangeEvent<
        HTMLInputElement
      >);
    expect(nestedComponent.props().customLabel).toBe('');
    nestedComponent.props().updateCustomLabel({
      target: { value: 'hello world' }
    } as React.ChangeEvent<HTMLInputElement>);
    expect(nestedComponent.props().customLabel).toBe('hello world');
  });

  it('returns custom label after custom label has been altered', () => {
    expect(nestedComponent.props().getLabel('ubuntu')).toBe('ubuntu');
    nestedComponent.props().updateCustomLabel({
      target: { value: 'hello world' }
    } as React.ChangeEvent<HTMLInputElement>);
    expect(nestedComponent.props().getLabel('ubuntu')).toBe('hello world');
  });

  it('returns custom label if not given args', () => {
    expect(nestedComponent.props().getLabel()).toBe('');
  });
});

describe('dedupe label', () => {
  it('adds an incrementor', () => {
    expect(dedupeLabel('my-label', ['my-label'])).toBe('my-label-001');
    expect(dedupeLabel('my-label', ['my-label-001'])).toBe('my-label');
    expect(dedupeLabel('my-label', ['my-label', 'my-label-002'])).toBe(
      'my-label-001'
    );
    expect(
      dedupeLabel('my-label', ['my-label', 'my-label-001', 'my-label003'])
    ).toBe('my-label-002');
  });
});
