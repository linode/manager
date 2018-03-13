import * as React from 'react';
import { mount } from 'enzyme';
import WithDocumentation from './WithDocumentation';

describe('WithDocumentation', () => {
  it('should return a title and render body.', () => {
    const result = mount(
      <WithDocumentation
        title="something"
        render={() => <div id="something" />}
        docs={[]}
      />,
    );
    
    const rendered = result.find('#something');
    const DOMtitle = result.find('[data-test-id="title"]').at(0).text();

    expect(rendered).toHaveLength(1);
    expect(DOMtitle).toEqual('something');
    expect(result.find('DocComponent')).toHaveLength(0);
  });

  it('should return a DocComponent for each doc.', () => {
    const result = mount(
      <WithDocumentation
        title="something"
        render={() => <div id="something" />}
        docs={[{ title: 'doc title', src: '#', body: 'this is a doc body' }]}
      />,
    );
    expect(result.find('WithStyles(DocComponent)')).toHaveLength(1);
  });
});
