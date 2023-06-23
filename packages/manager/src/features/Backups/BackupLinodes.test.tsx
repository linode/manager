import { shallow } from 'enzyme';
import * as React from 'react';

import { LinodeType } from '@linode/api-v4';
import { displayPrice as _display } from 'src/components/DisplayPrice';
import types from 'src/utilities/types.json';
import * as linodes from 'src/__data__/linodes';

import { ExtendedLinode } from './types';

const type = extendType(types.data[0] as LinodeType);

const linode1: ExtendedLinode = {
  ...linodes.linode1,
  typeInfo: type,
};
const linode2: ExtendedLinode = {
  ...linodes.linode2,
  typeInfo: type,
  linodeError: { linodeId: linodes.linode2.id, reason: 'Error occurred' },
};

import { extendType } from 'src/utilities/extendType';
import { BackupLinodes, displayPrice } from './BackupLinodes';

const component = shallow(
  <BackupLinodes
    linodes={[linode1, linode2]}
    classes={{ root: '', error: '' }}
  />
);

describe('BackupLinodes component', () => {
  describe('helper functions', () => {
    describe('displayPrice function', () => {
      it('should format numeric price information', () => {
        expect(displayPrice(5.5)).toEqual(_display(5.5));
      });
      it('should return the input if input is a string', () => {
        expect(displayPrice('Unavailable')).toEqual('Unavailable');
      });
    });
  });
  describe('component rendering', () => {
    it('should render its props', () => {
      expect(component.find('[data-qa-linodes]')).toHaveLength(2);
    });
  });
});
