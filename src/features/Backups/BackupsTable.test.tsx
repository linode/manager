import { shallow } from 'enzyme';
import * as React from 'react';

import * as linodes from 'src/__data__/linodes';
import * as types from 'src/__data__/types';
import CircleProgress from 'src/components/CircleProgress';

import { ExtendedLinode } from './BackupDrawer';
import { BackupsTable } from './BackupsTable';

const type = types.types[0];

const linode1: ExtendedLinode = {...linodes.linode1, typeInfo: type};
const linode2: ExtendedLinode = {...linodes.linode2, typeInfo: type};

const component = shallow(
  <BackupsTable
    linodes={[]}
    loading={true}
    classes={{root:'', container:''}}
  />
)

describe("BackupsTable component", () => {
  it("should render", () => {
    expect(component).toBeDefined();
  });
  it("should display a loading spinner", () => {
    expect(component.containsMatchingElement(
      <CircleProgress mini />
    )).toBeTruthy();
  });
  it("should display linodes", () => {
    component.setProps({ linodes: [linode1, linode2], loading: false });
    expect(component.find('[data-qa-linodes]'))
      .toHaveLength(2);
  });
});

