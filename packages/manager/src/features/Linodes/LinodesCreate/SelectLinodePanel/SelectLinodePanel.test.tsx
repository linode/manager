import { fireEvent } from '@testing-library/react';
import { rest } from 'msw';
import React from 'react';

import { imageFactory, linodeFactory } from 'src/factories';
import { breakpoints } from 'src/foundations/breakpoints';
import { server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { resizeScreenSize } from 'src/utilities/testHelpers';

import { SelectLinodePanel } from './SelectLinodePanel';

const defaultProps = {
  handleSelection: vi.fn(),
  linodes: linodeFactory.buildList(3),
};

const setupMocks = () => {
  const image1 = imageFactory.build({
    id: 'linode/debian10',
    label: 'Debian 10',
  });

  server.use(
    rest.get('*/linode/instances/:linodeId', (req, res, ctx) => {
      return res(ctx.json(defaultProps.linodes[0]));
    }),
    rest.get('*/images/:imageId', (req, res, ctx) => {
      return res(ctx.json(image1));
    })
  );
};

describe('SelectLinodePanel (table, desktop)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.lg);
    setupMocks();
  });

  it('renders as a table', async () => {
    const { container, findAllByRole, findByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(await findByRole('table')).toBeInTheDocument();

    expect(
      container.querySelector('[data-qa-linode-cards]')
    ).not.toBeInTheDocument();

    expect((await findAllByRole('row')).length).toBe(4);
  });

  it('selects the plan when clicked', async () => {
    const mockOnSelect = vi.fn();

    const { findAllByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} handleSelection={mockOnSelect} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    const radioInput = (await findAllByRole('radio'))[0];
    fireEvent.click(radioInput);

    expect(mockOnSelect).toHaveBeenCalledWith(
      0,
      defaultProps.linodes[0].type,
      defaultProps.linodes[0].specs.disk
    );
  });

  it('allows searching', async () => {
    setupMocks();

    const { findAllByRole, findByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    fireEvent.change(await findByRole('textbox'), {
      target: { value: defaultProps.linodes[0].label },
    });

    await expect((await findAllByRole('row')).length).toBe(2);

    expect((await findAllByRole('row'))[1]).toHaveTextContent(
      defaultProps.linodes[0].label
    );
  });

  it('displays the heading, notices and error', () => {
    const { getByText } = renderWithTheme(
      <SelectLinodePanel
        {...defaultProps}
        error={'Example error'}
        header={'Example header'}
        notices={['Example notice']}
      />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(getByText('Example error')).toBeInTheDocument();
    expect(getByText('Example header')).toBeInTheDocument();
    expect(getByText('Example notice')).toBeInTheDocument();
  });

  it('prefills the search box when mounted with a selected linode', async () => {
    setupMocks();

    const { container, findAllByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} selectedLinodeID={0} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(
      container.querySelector('[data-qa-linode-search] input')
    ).toHaveValue(defaultProps.linodes[0].label);

    expect((await findAllByRole('row')).length).toBe(2);

    expect((await findAllByRole('row'))[1]).toHaveTextContent(
      defaultProps.linodes[0].label
    );
  });
});

describe('SelectLinodePanel (cards, mobile)', () => {
  beforeAll(() => {
    resizeScreenSize(breakpoints.values.sm);
    setupMocks();
  });

  it('renders as cards', async () => {
    const { container, queryByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(queryByRole('table')).not.toBeInTheDocument();

    expect(container.querySelectorAll('[data-qa-selection-card]').length).toBe(
      3
    );
  });

  it('selects the plan when clicked', async () => {
    const mockOnSelect = vi.fn();

    const { container } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} handleSelection={mockOnSelect} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    const selectionCard = container.querySelectorAll(
      '[data-qa-selection-card]'
    )[0];
    fireEvent.click(selectionCard);

    expect(mockOnSelect).toHaveBeenCalledWith(
      0,
      defaultProps.linodes[0].type,
      defaultProps.linodes[0].specs.disk
    );
  });

  it('allows searching', async () => {
    setupMocks();

    const { container, findByRole } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    fireEvent.change(await findByRole('textbox'), {
      target: { value: defaultProps.linodes[0].label },
    });

    await expect(
      container.querySelectorAll('[data-qa-selection-card]').length
    ).toBe(1);

    expect(
      container.querySelectorAll('[data-qa-selection-card]')[0]
    ).toHaveTextContent(defaultProps.linodes[0].label);
  });

  it('displays the heading, notices and error', () => {
    const { getByText } = renderWithTheme(
      <SelectLinodePanel
        {...defaultProps}
        error={'Example error'}
        header={'Example header'}
        notices={['Example notice']}
      />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(getByText('Example error')).toBeInTheDocument();
    expect(getByText('Example header')).toBeInTheDocument();
    expect(getByText('Example notice')).toBeInTheDocument();
  });

  it('prefills the search box when mounted with a selected linode', async () => {
    setupMocks();

    const { container } = renderWithTheme(
      <SelectLinodePanel {...defaultProps} selectedLinodeID={0} />,
      {
        flags: { linodeCloneUiChanges: true },
      }
    );

    expect(
      container.querySelector('[data-qa-linode-search] input')
    ).toHaveValue(defaultProps.linodes[0].label);

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toBeInTheDocument();

    expect(
      container.querySelector('[data-qa-selection-card]')
    ).toHaveTextContent(defaultProps.linodes[0].label);
  });
});
