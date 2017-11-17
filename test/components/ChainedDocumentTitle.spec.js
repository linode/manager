import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';

import { ChainedDocumentTitle } from '~/components';

describe('components/ChainedDocumentTitle', () => {
  it('Sets the title of the page', () => {
    const page = mount(
      <ChainedDocumentTitle title="Test Page Title" />
    );

    expect(document.title).to.equal('Test Page Title');

    page.unmount();
  });

  it('Sets a chained title for the page based on depth', () => {
    const page = mount(
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

    page.unmount();
  });

  it('Supports child elements with a chained title', () => {
    const page = mount(
      <ChainedDocumentTitle title="Title">
        <ChainedDocumentTitle title="Subtitle A">
          <ChainedDocumentTitle title="Subtitle 1" />
        </ChainedDocumentTitle>
      </ChainedDocumentTitle>
    );

    expect(document.title).to.equal('Subtitle 1 - Subtitle A - Title');

    page.unmount();
  });
});
