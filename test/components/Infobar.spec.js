import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Infobar from '~/components/Infobar';
import * as fetch from '~/fetch';

describe('components/Infobar', () => {
  const sandbox = sinon.sandbox.create();

  afterEach(() => {
    sandbox.restore();
  });

  it('renders Infobar nav component', () => {
    const infobar = shallow(<Infobar />);

    expect(infobar.find('.fa-github')).to.exist;
    expect(infobar.find('.fa-twitter')).to.exist;
  });

  it('renders links', () => {
    const infobar = shallow(<Infobar />);

    expect(infobar.find({ to: 'https://github.com/linode' })).to.exist;
    expect(infobar.find({ to: 'https://twitter.com/linode' })).to.exist;
  });

  it('renders the latest blog post', () => {
    const infobar = shallow(<Infobar />);
    infobar.setState({ title: 'hello', link: 'https://example.org' });

    const link = infobar.find('a').first();
    expect(link.text()).to.equal('hello');
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
    const infobar = shallow(<Infobar />);
    await infobar.instance().componentDidMount();
    expect(fetchStub.calledWith('https://blog.linode.com/feed/'))
      .to.equal(true);
    expect(infobar.state('title')).to.equal('Introducing Fedora 24');
    expect(infobar.state('link')).to.equal('https://example.org');
  });
});
