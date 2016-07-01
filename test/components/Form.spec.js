import React from 'react';
import sinon from 'sinon';
import { mount, shallow } from 'enzyme';
import { expect } from 'chai';

import { Form, Input, Checkbox } from '../../src/components/Form';

/*
 * NOTE: formsy-react inputs cannot be tested on their own.
 * They must be inside a <Form> context.
 */

describe('components/Form', () => {
  const onSubmit = () => {};

  describe('components/Form/Input', () => {
    it('renders Input component with defaults', () => {
      const input = mount(
        <Form onSubmit={onSubmit}>
          <Input value="1" name="1" />
        </Form>
      );

      const { value, name, placeholder, type } = input.find('input').props();
      expect(value).to.equal('1');
      expect(name).to.equal('1');
      expect(placeholder).to.equal('');
      expect(type).to.equal('text');
      expect(input.find('.input-container')).to.exist;
    });

    it('renders Input component with custom props', () => {
      const input = mount(
        <Form onSubmit={onSubmit}>
          <Input value={1} name="1" type="number" className="foo" placeholder="bar" />
        </Form>
      );

      const { value, name, placeholder, type } = input.find('input').props();
      expect(value).to.equal(1);
      expect(name).to.equal('1');
      expect(placeholder).to.equal('bar');
      expect(type).to.equal('number');
      expect(input.find('.foo')).to.exist;
    });

    it('sets value onchange', () => {
      const input = mount(
        <Form onSubmit={onSubmit}>
          <Input value={1} name="1" type="number" />
        </Form>
      );

      input.find('input').simulate('change', { target: { value: 3 } });
      expect(input.find('input').props().value).to.equal(3);
    });
  });

  describe('components/Form/Checkbox', () => {
    it('renders Checkbox component with defaults', () => {
      const checkbox = mount(
        <Form onSubmit={onSubmit}>
          <Checkbox name="1" />
        </Form>
      );

      const { value, name, type } = checkbox.find('input').props();
      expect(value).to.equal(false);
      expect(name).to.equal('1');
      expect(type).to.equal('checkbox');
      expect(checkbox.find('label').text()).to.equal('');
      expect(checkbox.find('.checkbox')).to.exist;
    });

    it('renders Checkbox component with custom props', () => {
      const value = true;
      const checkbox = mount(
        <Form onSubmit={onSubmit}>
          <Checkbox name="1" value={value} className="foo" label="bar" />
        </Form>
      );

      const input = checkbox.find('input');
      expect(input.props().value).to.equal(true);
      expect(checkbox.find('label').text()).to.equal('bar');
      expect(checkbox.find('.foo')).to.exist;
    });

    it('changes checkbox value on change', () => {
      const form = mount(
        <Form onSubmit={onSubmit}>
          <Checkbox name="1" />
        </Form>
      );

      const c = form.find('input[type="checkbox"]');
      c.simulate('change');
      expect(c.props().value).to.equal(true);
    });
  });

  describe('components/Form/Form', () => {
    it('renders Form component', () => {
      const form = shallow(
        <Form className="my-form" onSubmit={onSubmit}>
          <Input value="1" name="1" />
        </Form>
      );

      expect(form.find('.my-form')).to.exist;
      expect(form.find('Input')).to.exist;
    });

    it('uses default mapInputs', () => {
      const env = { onSubmit };
      const onSubmitStub = sinon.stub(env, 'onSubmit');

      const form = mount(
        <Form onSubmit={onSubmitStub}>
          <Input value="1" name="2" />
        </Form>
      );

      form.simulate('submit');
      expect(onSubmitStub.calledOnce).to.equal(true);
      expect(onSubmitStub.calledWith({ 2: '1' })).to.equal(true);
      onSubmitStub.restore();
    });

    it('calls custom mapInputs and passes result to onSubmit on submit', () => {
      const env = { onSubmit };
      const onSubmitStub = sinon.stub(env, 'onSubmit');

      const mapInputs = { mapInputs: () => {} };
      const mapInputsStub = sinon.stub(mapInputs, 'mapInputs', ({ input1, input2 }) =>
        ({ inputs: [input1, input2] }));

      const form = mount(
        <Form mapInputs={mapInputsStub} onSubmit={onSubmitStub}>
          <Input value="1" name="input1" />
          <Input value="2" name="input2" />
        </Form>
      );

      form.simulate('submit');
      expect(mapInputsStub.calledWith({ input1: '1', input2: '2' })).to.equal(true);
      expect(onSubmitStub.calledWith({ inputs: ['1', '2'] })).to.equal(true);
      onSubmitStub.restore();
    });
  });
});
