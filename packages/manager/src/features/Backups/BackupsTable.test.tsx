import { LinodeType } from '@linode/api-v4';
import { shallow } from 'enzyme';
import * as React from 'react';
import types from 'src/utilities/types.json';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import * as linodes from 'src/__data__/linodes';
import { BackupsTable } from './BackupsTable';
import { ExtendedLinode } from './types';

const type = types.data[0];

const linode1: ExtendedLinode = {
  ...linodes.linode1,
  typeInfo: type as LinodeType,
};
const linode2: ExtendedLinode = {
  ...linodes.linode2,
  typeInfo: type as LinodeType,
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
    expect(component.find('WithStyles(BackupLinodes)')).toHaveLength(0);
    component.setProps({ linodes: [linode1, linode2], loading: false });
    expect(component.find('WithStyles(BackupLinodes)')).toHaveLength(1);
  });
});
