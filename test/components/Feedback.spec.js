import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { expect } from 'chai';

import Feedback from '~/components/Feedback';

describe('component/Feedback', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('it prefills with email', () => {
    const feedback = shallow(<Feedback email="email@gmail.com" />);

    expect(feedback.find('input[name="email"]').props().value).to.equal('email@gmail.com');
  });

  it('submits data onsubmit', () => {
    const submitFeedback = sandbox.spy();
    const feedback = shallow(
      <Feedback
        email="foo@gmail.com"
        submitFeedback={submitFeedback}
      />
    );

    feedback.instance().state.message = 'My message';
    feedback.find('form').simulate('submit');
    expect(submitFeedback.calledOnce).to.equal(true);
    expect(submitFeedback.firstCall.args[0]).to.deep.equal({
      email: 'foo@gmail.com',
      message: 'My message',
    });
  });

  it('calls hideShowFeedback when feedback button or nevermind is pressed', () => {
    const hideShowFeedback = sandbox.spy();
    const feedback = shallow(
      <Feedback
        hideShowFeedback={hideShowFeedback}
      />
    );

    feedback.find('.btn.btn-cancel').simulate('click');
    expect(hideShowFeedback.calledOnce).to.equal(true);

    feedback.find('.feedback-button').simulate('click');
    expect(hideShowFeedback.calledTwice).to.equal(true);
  });
});
