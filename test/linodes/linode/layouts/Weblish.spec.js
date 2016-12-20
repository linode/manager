import sinon from 'sinon';
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
});

