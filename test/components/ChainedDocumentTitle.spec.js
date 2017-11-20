import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { ChainedDocumentTitle } from '~/components';

describe('components/ChainedDocumentTitle', () => {
  let page = undefined;

  afterEach('The ReactDOM is cleared', () => {
    page.unmount();
  });

  it('Sets the title of the page', () => {
    page = mount(
      <ChainedDocumentTitle title="Test Page Title" />
    );

    expect(document.title).to.equal('Test Page Title');
  });

  it('Sets a chained title for the page based on depth', () => {
    page = mount(
      <div>
        <ChainedDocumentTitle title="Title" />
        <div>
          <ChainedDocumentTitle title="Subtitle A" />
          <div>
            <ChainedDocumentTitle title="Subtitle 1" />
          </div>
        </div>
      </div>
    );

    expect(document.title).to.equal('Subtitle 1 - Subtitle A - Title');
  });

  it('Supports child elements with a chained title', () => {
    page = mount(
      <ChainedDocumentTitle title="Title">
        <ChainedDocumentTitle title="Subtitle A">
          <ChainedDocumentTitle title="Subtitle 1" />
        </ChainedDocumentTitle>
      </ChainedDocumentTitle>
    );

    expect(document.title).to.equal('Subtitle 1 - Subtitle A - Title');
  });
});
