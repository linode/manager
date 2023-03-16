import * as React from 'react';
import { fireEvent, waitFor } from '@testing-library/react';
import { linodeFactory } from 'src/factories/linodes';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { rest, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { Props, LinodeMultiSelect } from './LinodeMultiSelect';

jest.mock('src/components/EnhancedSelect/Select');

const linodes = linodeFactory.buildList(10);

const props: Props = {
  onChange: jest.fn(),
  value: [],
};

describe.skip('Linode Multi Select', () => {
  describe('MultiSelect component', () => {
    it('should render error text if provided', () => {
      server.use(
        rest.get('*/linode/instances', (req, res, ctx) => {
          return res(ctx.json(makeResourcePage(linodes)));
        })
      );

      const errorText = 'This is an error message';
      const { getByText } = renderWithTheme(
        <LinodeMultiSelect {...props} errorText={errorText} />
      );
      getByText(errorText);
    });

    it('should filter out Linodes from a provided list', async () => {
      const filteredLinodes = [linodes[2].id, linodes[4].id];

      server.use(
        rest.get('*/linode/instances', (req, res, ctx) => {
          return res(ctx.json(makeResourcePage(linodes)));
        })
      );

      const { queryByText } = renderWithTheme(
        <LinodeMultiSelect {...props} filteredLinodes={filteredLinodes} />
      );
      await waitFor(() =>
        expect(queryByText(linodes[5].label)).toBeInTheDocument()
      );

      expect(queryByText(linodes[2].label)).not.toBeInTheDocument();
      expect(queryByText(linodes[4].label)).not.toBeInTheDocument();
    });

    it('should call its onSelect method with a list of Linode IDs', async () => {
      server.use(
        rest.get('*/linode/instances', (req, res, ctx) => {
          return res(ctx.json(makeResourcePage(linodes)));
        })
      );
      const { getByTestId } = renderWithTheme(<LinodeMultiSelect {...props} />);

      await waitFor(() =>
        fireEvent.change(getByTestId('select'), {
          target: { value: [linodes[1].id] },
        })
      );
      expect(props.onChange).toHaveBeenCalledWith([linodes[1].id]);
    });
  });
});
