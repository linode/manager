import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { Layout } from '~/layouts/Layout';
import { api } from '@/data';


describe('layouts/Layout', () => {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  const errors = {
    json: null,
    status: null,
    statusText: null,
    details: false,
  };

  function makeLayout(_dispatch = dispatch,
                      _errors = errors,
                      events = api.events,
                      linodes = api.linodes,
                      source = { source: 'foobar.html' },
                      children = <p>Hello world!</p>) {
    return (
      <Layout
        dispatch={_dispatch}
        errors={_errors}
        source={source}
        notifications={{ open: false }}
        session={{ open: false }}
        linodes={linodes}
        events={events}
        modal={{ open: false }}
      >{children}</Layout>
    );
  }

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  it('renders its children', () => {
    const component = shallow(makeLayout());
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(true);
  });

  it('renders a footer', () => {
    const component = shallow(makeLayout());
    const sourceLink = component.find('footer').find('ExternalLink');
    expect(sourceLink.props().children).to.equal('Page Source');
    expect(sourceLink.props().to)
      .to.equal('https://github.com/linode/manager/blob/master/foobar.html');
  });

  const errorsPopulated = {
    json: {
      errors: [
        { reason: 'You done screwed up' },
      ],
    },
    status: 400,
    statusText: 'Invalid Request',
    details: false,
  };

  it('does not render children on error', () => {
    const component = shallow(makeLayout(dispatch, errorsPopulated));
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(false);
  });

  it('renders a 404 page when appropriate', () => {
    const component = shallow(makeLayout(
      dispatch, { ...errorsPopulated, status: 404 }));
    expect(component.find('Error').length).to.equal(1);
  });
});
