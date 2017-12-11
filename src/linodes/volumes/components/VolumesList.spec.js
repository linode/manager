import { shallow, mount } from 'enzyme';
import React from 'react';
import sinon from 'sinon';

import { SHOW_MODAL } from '~/actions/modal';
import { VolumesList } from '~/linodes/volumes/components';

import { api } from '~/data';

const { volumes: { volumes } } = api;

describe('linodes/volumes/components/VolumesList', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  const dispatch = sandbox.spy();

  it('should render without error', () => {
    const dispatch = jest.fn();
    const wrapper = shallow(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
        objectType="volumes"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });


  it.skip('renders a table', () => {
    const wrapper = shallow(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
        objectType="volumes"
      />
    );

    const vol = wrapper.find('Table');
    expect(vol.prop('data')).toEqual(volumes);
  });

  it.skip('shows the delete modal when delete is pressed', () => {
    const wrapper = mount(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{}}
        volumes={volumes}
        objectType="volumes"
      />
    );
    const volDelete = wrapper.find('.TableRow Button').at(0);
    dispatch.reset();
    volDelete.simulate('click');
    expect(dispatch.callCount).toEqual(1);
    expect(dispatch.firstCall.args[0]).toHaveProperty('type', SHOW_MODAL);
  });

  it.skip('deletes selected volumes when delete is pressed', () => {
    const spy = jest.spyOn(VolumesList.prototype, 'deleteVolumes');
    const page = mount(
      <VolumesList
        dispatch={dispatch}
        selectedMap={{ 38: true }}
        volumes={volumes}
        objectType="volumes"
      />
    );

    const deleteButton = page.find('MassEditControl button#delete');
    deleteButton.simulate('click');

    expect(spy).toHaveBeenCalled();
  });
});
