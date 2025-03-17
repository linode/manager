import { linodeFactory } from '@linode/utilities';
import * as React from 'react';

import { typeFactory } from 'src/factories/types';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RescueDialog } from './RescueDialog';

import type { Props } from './RescueDialog';

const standard = typeFactory.build({ id: 'g6-standard-1' });
const metal = typeFactory.build({ class: 'metal', id: 'g6-metal-alpha-2' });

const normalLinode = linodeFactory.build({ type: 'g6-standard-1' });
const metalLinode = linodeFactory.build({ type: 'g6-metal-alpha-2' });

const queryMocks = vi.hoisted(() => ({
  useLinodeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
  useTypeQuery: vi.fn().mockReturnValue({
    data: undefined,
  }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useLinodeQuery: queryMocks.useLinodeQuery,
  };
});

vi.mock('src/queries/types', async () => {
  const actual = await vi.importActual<any>('src/queries/types');
  return {
    ...actual,
    useTypeQuery: queryMocks.useTypeQuery,
  };
});

const props: Props = {
  linodeId: normalLinode.id,
  linodeLabel: normalLinode.label,
  onClose: vi.fn(),
  open: true,
};

describe('RescueDialog', () => {
  it('should render the rescue modal for a normal instance', () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: standard,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: normalLinode,
    });

    const { getByTestId, getByText } = renderWithTheme(
      <RescueDialog {...props} />
    );

    expect(getByText(/Rescue Linode/)).toBeInTheDocument();
    expect(getByTestId('device-select')).toBeInTheDocument();
  });

  it('should render a confirmation modal for a bare metal instance', () => {
    queryMocks.useTypeQuery.mockReturnValue({
      data: metal,
    });

    queryMocks.useLinodeQuery.mockReturnValue({
      data: metalLinode,
    });

    const { getByText, queryByTestId } = renderWithTheme(
      <RescueDialog {...props} linodeId={metalLinode.id} />
    );

    expect(getByText(/Rescue Linode/)).toBeInTheDocument();
    expect(queryByTestId('device-select')).toBeNull();
  });
});
