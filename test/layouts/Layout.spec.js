import React from 'react';
import sinon from 'sinon';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { Layout } from '../../src/layouts/Layout';
import * as fetch from '~/fetch';

describe('layouts/Layout', () => {
  const sandbox = sinon.sandbox.create();
  let dispatch = sandbox.spy();

  afterEach(() => {
    sandbox.restore();
    dispatch = sandbox.spy();
  });

  const errors = {
    json: null,
    status: null,
    statusText: null,
    details: false,
  };

  it('renders its children', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={errors}
      ><p>Hello world!</p></Layout>);
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(true);
  });

  it('renders a sidebar', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={errors}
      ><p>Hello world!</p></Layout>);
    expect(component.find('Sidebar')).to.exist;
  });

  it('renders a header', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={errors}
      ><p>Hello world!</p></Layout>);
    expect(component.find('Header')).to.exist;
  });

  it('renders a modal', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={errors}
      ><p>Hello world!</p></Layout>);
    expect(component.find('Modal')).to.exist;
  });

  const errorsPopulated = {
    json: {
      errors: [
        { reason: 'You done fucked up' },
      ],
    },
    status: 400,
    statusText: 'Invalid Request',
    details: false,
  };

  it('does not render children on error', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={errorsPopulated}
      ><p>Hello world!</p></Layout>);
    expect(component.contains(<p>Hello world!</p>))
      .to.equal(false);
  });

  it('renders a 404 page when appropriate', () => {
    const component = shallow(
      <Layout
        dispatch={dispatch}
        errors={{ ...errorsPopulated, status: 404 }}
      ><p>Hello world!</p></Layout>);
    expect(component.find('NotFound')).to.exist;
  });

  it('fetches the blog RSS feed', async () => {
    /* eslint-disable prefer-template */
    const fetchStub = sandbox.stub(fetch, 'rawFetch').returns({
      text: () => '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">' +
          '<channel>' +
            '<item>' +
              '<title>Introducing Fedora 24</title>' +
              '<link>https://example.org</link>' +
            '</item>' +
          '</channel>' +
        '</rss>',
    });

    /* eslint-enable prefer-template */
    const layout = shallow(
      <Layout errors={errors} dispatch={dispatch}>
        <p>Hello world</p>
      </Layout>);
    await layout.instance().componentDidMount();
    expect(fetchStub.calledWith('https://blog.linode.com/feed/'))
      .to.equal(true);
    expect(layout.state('title')).to.equal('Introducing Fedora 24');
    expect(layout.state('link')).to.equal('https://example.org');
  });
});
