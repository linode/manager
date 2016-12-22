import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import * as weblish from '~/linodes/linode/layouts/Weblish';

describe('linodes/linode/layouts/Weblish', () => {
  const sandbox = sinon.sandbox.create();

  const dispatch = sandbox.spy();

  afterEach(() => {
    dispatch.reset();
    sandbox.restore();
  });

  it('tests addCSSLink', () => {
    const before = window.document.querySelector('head').querySelector('link');
    expect(before).to.equal(null);
    weblish.addCSSLink('http://example.com');
    const after = window.document.querySelector('head').querySelector('link').outerHTML;
    expect(after).to.equal('<link rel="stylesheet" type="text/css" href="http://example.com">');
  });

  it('tests addJSScript', () => {
    const before = window.document.querySelector('head').querySelector('script');
    expect(before).to.equal(null);
    weblish.addJSScript('http://example.com');
    const after = window.document.querySelector('head').querySelector('script').outerHTML;
    expect(after).to.equal('<script src="http://example.com"></script>');
  });

  it('tests the Weblish constructor', () => {
    shallow(<weblish.Weblish />);
    const linksExpected = {
      0: '<link rel="stylesheet" type="text/css" href="http://example.com">',
      1: '<link rel="stylesheet" type="text/css" href="/assets/weblish/weblish-fonts.css">',
      2: '<link rel="stylesheet" type="text/css" href="/assets/weblish/weblish.css">',
      3: '<link rel="stylesheet" type="text/css" href="/assets/weblish/xterm.css">',
      length: 4,
    };
    const links = window.document.querySelector('head').querySelectorAll('link');
    expect(links[1].outerHTML).to.equal(linksExpected[1]);
    expect(links[2].outerHTML).to.equal(linksExpected[2]);
    expect(links[3].outerHTML).to.equal(linksExpected[3]);
    expect(links.length).to.equal(4);
    const scripts = window.document.querySelector('head').querySelectorAll('script');
    const scriptsExpected = {
      0: '<script src="http://example.com"></script>',
      1: '<script src="/assets/weblish/xterm.js"></script>',
      length: 2,
    };
    expect(scripts[1].outerHTML).to.equal(scriptsExpected[1]);
    expect(scripts.length).to.equal(2);
  });
});

