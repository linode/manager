import { expect } from 'chai';
import { mount } from 'enzyme';
import react from 'react';
import sinon from 'sinon';

import { show_modal } from '~/actions/modal';
import { getemailhash } from '~/cache';
import { gravatar_base_url } from '~/constants';
import { indexpage } from '~/stackscripts/layouts/indexpage';

import { api } from '@/data';
import { expectrequest } from '@/common.js';
import { profile } from '@/data/profile';


const { stackscripts } = api;

describe('stackscripts/layouts/indexpage', () => {
  const sandbox = sinon.sandbox.create();

  aftereach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('renders a list of stackscripts', () => {
    const page = mount(
      <indexpage
        dispatch={dispatch}
        selectedmap={{}}
        profile={profile}
        stackscripts={stackscripts}
      />
    );

    const zone = page.find('.tablerow');
    // + 1 for the group
    expect(zone.length).to.equal(object.keys(stackscripts.stackscripts).length);
    const firstzone = zone.at(0);
    expect(firstzone.find('td img').props().src)
      .to.equal(`${gravatar_base_url}${getemailhash('example1@domain.com')}`);
    expect(firstzone.find('link').props().to)
      .to.equal('/stackscripts/teststackscript1');
    expect(firstzone.find('td').at(2).text())
      .to.equal('teststackscript1');
    expect(firstzone.find('td').at(3).text())
      .to.equal('example1@domain.com');
    expect(firstzone.find('td').at(4).text())
      .to.equal('unrestricted');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <indexpage
        dispatch={dispatch}
        selectedmap={{}}
        profile={profile}
        stackscripts={stackscripts}
      />
    );

    const zonedelete = page.find('.tablerow button').at(0);
    dispatch.reset();
    zonedelete.simulate('click');
    expect(dispatch.callcount).to.equal(1);
    expect(dispatch.firstcall.args[0])
      .to.have.property('type').which.equals(show_modal);
  });

  it('deletes selected stackscripts when delete is pressed', async () => {
    const page = mount(
      <indexpage
        dispatch={dispatch}
        selectedmap={{ 1: true }}
        profile={profile}
        stackscripts={stackscripts}
      />
    );

    dispatch.reset();

    page.find('tr button').at(0).simulate('click');
    const modal = mount(dispatch.firstcall.args[0].body);

    dispatch.reset();
    modal.find('form').props().onsubmit({ preventdefault() {} });
    const fn = dispatch.firstcall.args[0];
    await expectrequest(fn, '/account/stackscripts/teststackscript1', { method: 'delete' });
  });
});
