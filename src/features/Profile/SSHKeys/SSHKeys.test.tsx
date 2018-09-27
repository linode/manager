import { shallow } from 'enzyme';
import * as React from 'react';
import { SSHKeys } from './SSHKeys';
/**
 * Displays a table
 * Table has 4 columns
 * Row contains label, key, fingerprint, relative date, and action menu.
 */

describe('SSHKeys', () => {
  const updateOrderBy = jest.fn();
  const handlePageChange = jest.fn();
  const handlePageSizeChange = jest.fn();
  const request = jest.fn();

  describe('layout', () => {
    const wrapper = shallow(
      <SSHKeys
        classes={{ root: '' }}
        count={3}
        error={undefined}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loading={false}
        order={'asc'}
        orderBy={undefined}
        page={1}
        pageSize={25}
        request={request}
        data={[
          { id: 1, label: '', ssh_key: '', created: '', fingerprint: '', },
          { id: 2, label: '', ssh_key: '', created: '', fingerprint: '', },
          { id: 3, label: '', ssh_key: '', created: '', fingerprint: '', },
        ]}
        timezone={'GMT'}
        updateOrderBy={updateOrderBy}
      />
    );

    it('should have table header with SSH Keys title and an action', () => {
      expect(wrapper.find(`WithStyles(TableHeader)[title="SSH Keys"][action]`).exists()).toBeTruthy();
    });

    it('should have a table', () => {
      expect(wrapper.find(`WithStyles(WrappedTable)`).exists()).toBeTruthy();
    });

    it('should have pagination controls', () => {
      expect(wrapper.find(`WithStyles(PaginationFooter)`).exists()).toBeTruthy();
    });

    it('should display table row for each key', () => {
      expect(wrapper.find(`WithStyles(TableRow)[data-qa-content-row]`)).toHaveLength(3)
    });
  });

  it('should display TableRowLoading if props.loading is true.', () => {
    const wrapper = shallow(
      <SSHKeys
        classes={{ root: '' }}
        count={0}
        error={undefined}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loading={true}
        order={'asc'}
        orderBy={undefined}
        page={1}
        pageSize={25}
        request={request}
        data={undefined}
        timezone={'GMT'}
        updateOrderBy={updateOrderBy}
      />
    );

    expect(wrapper.find(`WithStyles(tableRowLoading)`).exists()).toBeTruthy();
  });

  it('should display TableRowError if error if state.error is set.', () => {
    const wrapper = shallow(
      <SSHKeys
        classes={{ root: '' }}
        count={0}
        error={Error('Shenanigans')}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loading={false}
        order={'asc'}
        orderBy={undefined}
        page={1}
        pageSize={25}
        request={request}
        data={undefined}
        timezone={'GMT'}
        updateOrderBy={updateOrderBy}
      />
    );

    expect(wrapper.find(`WithStyles(TableRowError)`).exists()).toBeTruthy();
  });

  it('should display TableEmptyState if done loading and count is 0', () => {
    const wrapper = shallow(
      <SSHKeys
        classes={{ root: '' }}
        count={0}
        error={undefined}
        handlePageChange={handlePageChange}
        handlePageSizeChange={handlePageSizeChange}
        loading={false}
        order={'asc'}
        orderBy={undefined}
        page={1}
        pageSize={25}
        request={request}
        data={undefined}
        timezone={'GMT'}
        updateOrderBy={updateOrderBy}
      />
    );

    expect(wrapper.find(`WithStyles(TableRowEmptyState)`).exists()).toBeTruthy();
  });
});
