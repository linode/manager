import { LinodeType } from '@linode/api-v4';
import { shallow } from 'enzyme';
import * as React from 'react';

import * as linodes from 'src/__data__/linodes';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { extendType } from 'src/utilities/extendType';
import types from 'src/utilities/types.json';

import { BackupsTable } from './BackupsTable';
import { ExtendedLinode } from './types';

const type = extendType(types.data[0] as LinodeType);

const linode1: ExtendedLinode = {
  ...linodes.linode1,
  typeInfo: type,
};
const linode2: ExtendedLinode = {
  ...linodes.linode2,
  typeInfo: type,
};

const component = shallow(<BackupsTable linodes={[]} loading={true} />);

describe('BackupsTable component', () => {
  it('should render', () => {
    expect(component).toBeDefined();
  });
  it('should display a loading spinner', () => {
    expect(
      component.containsMatchingElement(<TableRowLoading columns={3} />)
    ).toBeTruthy();
  });
  it('should display linodes', () => {
    expect(component.find('BackupLinodes')).toHaveLength(0);
    component.setProps({ linodes: [linode1, linode2], loading: false });
    expect(component.find('BackupLinodes')).toHaveLength(1);
  });
});
