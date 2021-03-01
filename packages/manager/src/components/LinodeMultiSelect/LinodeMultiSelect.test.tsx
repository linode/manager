import { fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';

import { linodeFactory } from 'src/factories/linodes';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  CombinedProps,
  generateOptions,
  LinodeMultiSelect,
  userSelectedAllLinodes,
} from './LinodeMultiSelect';

jest.mock('src/components/EnhancedSelect/Select');

const linodes = linodeFactory.buildList(10);

const props: CombinedProps = {
  handleChange: jest.fn(),
  linodesLoading: false,
  linodesData: linodes,
  linodesResults: linodes.length,
  linodesLastUpdated: 1000,
  selectedLinodes: [],
  showAllOption: true,
  getLinodes: jest.fn(),
};

const allLinodesOption = { label: 'All Linodes', value: 'ALL' };

const optionsWithSelectAll = [
  allLinodesOption,
  { label: 'my-linode', value: 1234456 },
];

const optionsWithoutSelectAll = [
  { label: 'my-linode', value: 1234456 },
  { label: 'my-linode-2', value: 999999 },
];

describe('Linode Multi Select', () => {
  describe('userSelectedAllLinodes selector', () => {
    it('should return true ALL is among the selected options', () => {
      expect(userSelectedAllLinodes(optionsWithSelectAll)).toBe(true);
    });

    it('should return false if ALL is not among the selected options', () => {
      expect(userSelectedAllLinodes(optionsWithoutSelectAll)).toBe(false);
    });

    it('should return false if nothing is selected', () => {
      expect(userSelectedAllLinodes([])).toBe(false);
    });
  });

  describe('generateOptions', () => {
    it('should return a list of items based on the provided Linodes data', () => {
      const options = generateOptions(false, true, linodes, undefined);
      expect(options).toHaveLength(linodes.length + 1);
      expect(options[1]).toHaveProperty('value');
      expect(options[1]).toHaveProperty('label');
    });

    it('should include an All Linodes option', () => {
      const options = generateOptions(false, true, linodes, undefined);
      expect(options).toContainEqual(allLinodesOption);
    });

    it('should return nothing if there is an error', () => {
      const options = generateOptions(false, true, linodes, [
        { reason: 'an error ' },
      ]);
      expect(options).toEqual([]);
    });

    it('should only return the ALL option if the allLinodesSelected argument is true', () => {
      const options = generateOptions(true, true, linodes, undefined);
      expect(options).toEqual([allLinodesOption]);
    });

    it('should not include the All Linodes option if the param is false', () => {
      const options = generateOptions(true, false, linodes, undefined);
      expect(options).not.toContainEqual(allLinodesOption);
      expect(options.length).toBe(linodes.length);
    });
  });

  describe('MultiSelect component', () => {
    it('should render error text if provided', () => {
      const errorText = 'This is an error message';
      const { getByText } = renderWithTheme(
        <LinodeMultiSelect {...props} errorText={errorText} />
      );
      getByText(errorText);
    });

    it('should filter out Linodes from a provided list', () => {
      const filteredLinodes = [linodes[2].id, linodes[4].id];
      const { queryByText } = renderWithTheme(
        <LinodeMultiSelect {...props} filteredLinodes={filteredLinodes} />
      );
      expect(queryByText(linodes[2].label)).not.toBeInTheDocument();
      expect(queryByText(linodes[4].label)).not.toBeInTheDocument();
      expect(queryByText(linodes[5].label)).toBeInTheDocument();
    });

    it('should call its handleSelect method with a list of Linode IDs', async () => {
      const { getByTestId } = renderWithTheme(<LinodeMultiSelect {...props} />);

      await waitFor(() =>
        fireEvent.change(getByTestId('select'), {
          target: { value: [linodes[1].id] },
        })
      );
      expect(props.handleChange).toHaveBeenCalledWith([linodes[1].id]);
    });

    it('should call its handleSelect method with all Linode IDs if ALL is selected', async () => {
      const { getByTestId } = renderWithTheme(<LinodeMultiSelect {...props} />);

      await waitFor(() =>
        fireEvent.change(getByTestId('select'), {
          target: { value: ['ALL'] },
        })
      );
      expect(props.handleChange).toHaveBeenCalledWith(linodes.map((i) => i.id));
    });
  });
});
