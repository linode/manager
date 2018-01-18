import { mount, shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { StaticRouter } from 'react-router-dom';

import { SHOW_MODAL } from '~/actions/modal';
import { getEmailHash } from '~/cache';
import { GRAVATAR_BASE_URL } from '~/constants';
import { IndexPage } from '~/users/layouts/IndexPage';

import { api } from '~/data';
import { expectRequest } from '~/test.helpers.js';
import { profile } from '~/data/profile';


const { users } = api;

describe('users/layouts/IndexPage', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('should render without error', () => {
    const mockDispatch = jest.fn();
    const wrapper = shallow(
      <StaticRouter>
        <IndexPage dispatch={mockDispatch} selectedMap={{}} profile={profile} users={users} />
      </StaticRouter>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders a list of Users', () => {
    const page = mount(
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          selectedMap={{}}
          profile={profile}
          users={users}
        />
      </StaticRouter>
    );

    const zone = page.find('.TableRow');
    // + 1 for the group
    expect(zone.length).toBe(Object.keys(users.users).length);
    const firstZone = zone.at(0);
    expect(firstZone.find('td img').props().src)
      .toBe(`${GRAVATAR_BASE_URL}${getEmailHash('example1@domain.com')}`);
    expect(firstZone.find('Link').props().to)
      .toBe('/users/testuser1');
    expect(firstZone.find('td').at(2).text())
      .toBe('testuser1');
    expect(firstZone.find('td').at(3).text())
      .toBe('example1@domain.com');
    expect(firstZone.find('td').at(4).text())
      .toBe('Unrestricted');
  });

  it('shows the delete modal when delete is pressed', () => {
    const page = mount(
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          selectedMap={{}}
          profile={profile}
          users={users}
        />
      </StaticRouter>
    );

    const zoneDelete = page.find('.TableRow Button').at(0);
    dispatch.reset();
    zoneDelete.simulate('click');
    expect(dispatch.callCount).toBe(1);
    expect(dispatch.firstCall.args[0]).toHaveProperty('type');
    expect(dispatch.firstCall.args[0].type).toBe(SHOW_MODAL);
  });

  it.skip('deletes selected users when delete is pressed', async () => {
    const page = mount(
      <StaticRouter>
        <IndexPage
          dispatch={dispatch}
          selectedMap={{ 1: true }}
          profile={profile}
          users={users}
        />
      </StaticRouter>
    );

    dispatch.reset();

    page.find('tr button').at(0).simulate('click');
    expect(dispatch.callCount).toBe(1);
    const modal = mount(dispatch.firstCall.args[0].body);

    dispatch.reset();
    modal.find('Form').props().onSubmit({ preventDefault() { } });
    const fn = dispatch.firstCall.args[0];
    await expectRequest(fn, '/account/users/testuser1', { method: 'DELETE' });
  });
});
