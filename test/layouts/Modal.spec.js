import React from 'react';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { HIDE_MODAL } from '~/actions/modal';
import { Modal } from '~/layouts/Modal';

describe('components/Modal', () => {
  it('renders Modal component', () => {
    const modal = mount(
      <Modal title="title" body="body" />
    );

    expect(modal.find('.modal-header h3').text()).to.equal('title');
    expect(modal.find('.modal-body').text()).to.equal('body');
  });

  it('closes when clicking on the overlay', () => {
    const dispatch = sinon.spy();
    const modal = mount(
      <Modal
        open={true} // eslint-disable-line react/jsx-boolean-value
        dispatch={dispatch}
      />
    );

    modal.simulate('click');
    expect(dispatch.calledWith({
      type: HIDE_MODAL,
    })).to.equal(true);
  });

  it('does not close when clicking inside the modal', () => {
    const dispatch = sinon.spy();
    const modal = mount(
      <Modal
        open={true} // eslint-disable-line react/jsx-boolean-value
        dispatch={dispatch}
      />
    );

    modal.find('.modal').simulate('click');
    expect(dispatch.callCount).to.equal(0);
  });
});
