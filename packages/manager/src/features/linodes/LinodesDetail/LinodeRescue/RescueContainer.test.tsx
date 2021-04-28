import { screen } from '@testing-library/react';
import * as React from 'react';
import { linodeFactory } from 'src/factories/linodes';
import { typeFactory } from 'src/factories/types';
import { renderWithTheme } from 'src/utilities/testHelpers';
import RescueContainer, { Props } from './RescueContainer';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ id: 'g6-metal-alpha-2', class: 'metal' });

const normalLinode = linodeFactory.build({ type: 'g6-standard-1' });
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
        types: { entities: [standard, metal] },
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
    expect(screen.queryByTestId('device-select')).toBeNull();
  });
});
