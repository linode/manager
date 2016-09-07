import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import { api } from '@/data';
import { testLinode } from '@/data/linodes';
import { expectRequest } from '@/common';
import { ConfigEdit } from '~/linodes/settings/layouts/ConfigEdit';
const { linodes, kernels } = api;

describe('linodes/settings/layouts/ConfigEdit', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const props = {
    linodes,
    kernels,
    dispatch: () => {},
    params: {
      linodeId: testLinode.id,
      configId: 12345,
    },
  };

  it('renders all fields', () => {
    const page = shallow(
      <ConfigEdit
        {...props}
      />);
    expect(page.find('FormGroup[field="label"]').length).to.equal(1);
    expect(page.find('FormGroup[field="comments"]').length).to.equal(1);
    expect(page.find('input[id="config-virt_mode-paravirt"]').length)
      .to.equal(1);
    expect(page.find('input[id="config-virt_mode-fullvirt"]').length)
      .to.equal(1);
    expect(page.find('select[id="config-kernel"]').length)
      .to.equal(1);
    expect(page.find('input[id="config-run_level-default"]').length)
      .to.equal(1);
    expect(page.find('input[id="config-run_level-single"]').length)
      .to.equal(1);
    expect(page.find('input[id="config-run_level-binbash"]').length)
      .to.equal(1);
    expect(page.find('Slider').length).to.equal(1);
  });

  it('renders cancel link', () => {
    const page = shallow(
      <ConfigEdit
        {...props}
      />);
    const btn = page.find('Link');
    expect(btn.length).to.equal(1);
    expect(btn.props().to)
      .to.equal(`/linodes/${testLinode.id}/settings/advanced`);
  });

  it('commits changes to the state as edits are made', () => {
    const page = shallow(
      <ConfigEdit
        {...props}
      />);
    const label = page.find('FormGroup[field="label"]');
    const comments = page.find('FormGroup[field="comments"]');
    const paravirt = page.find('input[id="config-virt_mode-paravirt"]');
    const fullvirt = page.find('input[id="config-virt_mode-fullvirt"]');
    const kernel = page.find('select[id="config-kernel"]');
    const defaultRunLevel = page.find('input[id="config-run_level-default"]');
    const single = page.find('input[id="config-run_level-single"]');
    const binbash = page.find('input[id="config-run_level-binbash"]');
    const memlimit = page.find('Slider');
    label.find('input').simulate('change', { target: { value: 'new label' } });
    expect(page.state('label')).to.equal('new label');
    comments.find('textarea').simulate('change', { target: { value: 'new comments' } });
    expect(page.state('comments')).to.equal('new comments');
    paravirt.simulate('change', { target: { value: 'paravirt' } });
    expect(page.state('virt_mode')).to.equal('paravirt');
    fullvirt.simulate('change', { target: { value: 'fullvirt' } });
    expect(page.state('virt_mode')).to.equal('fullvirt');
    kernel.simulate('change', { target: { value: 'linode/latest' } });
    expect(page.state('kernel')).to.equal('linode/latest');
    defaultRunLevel.simulate('change', { target: { value: 'default' } });
    expect(page.state('run_level')).to.equal('default');
    single.simulate('change', { target: { value: 'single' } });
    expect(page.state('run_level')).to.equal('single');
    binbash.simulate('change', { target: { value: 'binbash' } });
    expect(page.state('run_level')).to.equal('binbash');
    memlimit.props().onChange(1234);
    expect(page.state('ram_limit')).to.equal(1234);
  });

  it('calls saveChanges when save is pressed', () => {
    const page = shallow(
      <ConfigEdit
        {...props}
      />);
    const saveChanges = sandbox.stub(page.instance(), 'saveChanges');
    page.find('.btn-primary').simulate('click');
    expect(saveChanges.calledOnce).to.equal(true);
  });

  describe('saveChanges', () => {
    it('commits changes to the API', async () => {
      const dispatch = sandbox.spy();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />);
      const label = page.find('FormGroup[field="label"]');
      label.find('input').simulate('change', { target: { value: 'new label' } });
      await page.instance().saveChanges();
      expect(dispatch.calledOnce).to.equal(true);
      const fn = dispatch.firstCall.args[0];
      await expectRequest(fn, `/linodes/${testLinode.id}/configs/12345`,
        () => {}, null, options => {
          expect(options.method).to.equal('PUT');
          expect(JSON.parse(options.body)).to.deep.equal({
            virt_mode: 'paravirt',
            run_level: 'default',
            comments: '',
            label: 'new label',
            ram_limit: 0,
            // kernel: { id: '' }, // TODO
            helpers: {
              disable_update_db: false,
              enable_distro_helper: true,
              enable_network_helper: true,
              enable_modules_dep_helper: true,
            },
          });
        });
    });

    it('handles API errors', async () => {
      const dispatch = sandbox.stub();
      const page = shallow(
        <ConfigEdit
          {...props}
          dispatch={dispatch}
        />);
      dispatch.throws({
        json: () => ({
          errors: [{ field: 'label', reason: 'you suck at naming things' }],
        }),
      });
      await page.instance().saveChanges();
      expect(page.state('errors'))
        .to.have.property('label')
        .that.deep.equals([{
          field: 'label',
          reason: 'you suck at naming things',
        }]);
    });
  });
});
