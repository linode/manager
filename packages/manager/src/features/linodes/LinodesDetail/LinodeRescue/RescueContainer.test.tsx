import { screen } from '@testing-library/react';
import * as React from 'react';
import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RescueContainer, { Props } from './RescueContainer';

const types = require('src/cachedData/types.json');

const normalLinode = linodeFactory.build();
const metalLinode = linodeFactory.build({ type: 'g6-metal-alpha-2' });

const props: Props = {
  linodeId: normalLinode.id,
  onClose: jest.fn(),
  open: true,
};

const render = (propOverride?: unknown) =>
  renderWithTheme(<RescueContainer {...props} {...propOverride} />, {
    customStore: {
      __resources: {
        linodes: {
          itemsById: {
            [normalLinode.id]: normalLinode,
            [metalLinode.id]: metalLinode,
          },
        },
        types: { entities: types.data },
      },
    },
  });

describe('RescueContainer', () => {
  it('should render the rescue modal for a normal instance', () => {
    render();
    expect(screen.getByText(/Rescue Linode/)).toBeInTheDocument();
    expect(screen.getByTestId('device-select')).toBeInTheDocument();
  });

  it('should render a confirmation modal for a bare metal instance', () => {
    render({ linodeId: metalLinode.id });
    expect(screen.getByText(/Rescue Linode/)).toBeInTheDocument();
    screen.debug();
    expect(screen.getByTestId('device-select')).not.toBeInTheDocument();
  });
});
