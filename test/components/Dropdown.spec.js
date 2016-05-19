import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass
} from 'react-addons-test-utils';
import { expect } from 'chai';
import Dropdown from '../../src/components/Dropdown';

describe('Dropdown', () => {
  it('renders dropdown component', () => {
    const dropdown = renderIntoDocument(
      <Dropdown elements={[
        { _action: "ready", name: "Drew" },
        { _action: "set", name: "Phil" },
        { _action: "go", name: "Will" }
      ]} />
    );

    const list = scryRenderedDOMComponentsWithClass(dropdown, 'li-dropdown-item');

    expect(list.length).to.equal(3);
    expect(list[0].textContent).to.equal('Drew');
    expect(list[1].textContent).to.equal('Phil');
    expect(list[2].textContent).to.equal('Will');
  });
});
