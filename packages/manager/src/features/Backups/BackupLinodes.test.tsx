import { LinodeType } from '@linode/api-v4';
import { render } from '@testing-library/react';
import * as React from 'react';

import * as linodes from 'src/__data__/linodes';
import { displayPrice as _display } from 'src/components/DisplayPrice';
import { extendType } from 'src/utilities/extendType';
import { wrapWithTableBody } from 'src/utilities/testHelpers';
import types from 'src/utilities/types.json';

import { BackupLinodes, displayPrice } from './BackupLinodes';
import { ExtendedLinode } from './types';

const type = extendType(types.data[0] as LinodeType);

const linode1: ExtendedLinode = {
  ...linodes.linode1,
  typeInfo: type,
};
const linode2: ExtendedLinode = {
  ...linodes.linode2,
  linodeError: { linodeId: linodes.linode2.id, reason: 'Error occurred' },
  typeInfo: type,
};

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
      const { getAllByTestId } = render(
        wrapWithTableBody(<BackupLinodes linodes={[linode1, linode2]} />)
      );
      expect(getAllByTestId('backup-linode-table-row')).toHaveLength(2);
    });
  });
});
