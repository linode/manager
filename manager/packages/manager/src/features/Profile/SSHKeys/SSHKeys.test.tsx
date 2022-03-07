import { shallow } from 'enzyme';
import * as React from 'react';
import { pageyProps } from 'src/__data__/pageyProps';
import { SSHKeys } from './SSHKeys';

/**
 * Displays a table
 * Table has 4 columns
 * Row contains label, key, fingerprint, relative date, and action menu.
 */

describe('SSHKeys', () => {
  describe('layout', () => {
    const wrapper = shallow(
      <SSHKeys
        {...pageyProps}
        classes={{
          sshKeysHeader: '',
          addNewWrapper: '',
          createdCell: '',
        }}
        data={[
          { id: 1, label: '', ssh_key: '', created: '', fingerprint: '' },
          { id: 2, label: '', ssh_key: '', created: '', fingerprint: '' },
          { id: 3, label: '', ssh_key: '', created: '', fingerprint: '' },
        ]}
        timezone={'GMT'}
      />
    );

    it('should have table header with SSH Keys title', () => {
      expect(
        wrapper
          .find('WithStyles(ForwardRef(TableHead))[data-qa-table-head]')
          .exists()
      ).toBeTruthy();
    });

    it('should have a table', () => {
      expect(wrapper.find(`WrappedTable`).exists()).toBeTruthy();
    });

    it('should have pagination controls', () => {
      expect(
        wrapper.find(`WithStyles(PaginationFooter)`).exists()
      ).toBeTruthy();
    });

    it('should display table row for each key', () => {
      expect(wrapper.find('[data-qa-content-row]')).toHaveLength(3);
    });
  });

  it('should display TableRowLoading if props.loading is true.', () => {
    const wrapper = shallow(
      <SSHKeys
        {...pageyProps}
        classes={{
          sshKeysHeader: '',
          addNewWrapper: '',
          createdCell: '',
        }}
        data={undefined}
        loading={true}
        timezone={'GMT'}
      />
    );

    expect(wrapper.find(`TableRowLoading`).exists()).toBeTruthy();
  });

  it('should display TableRowError if error if state.error is set.', () => {
    const wrapper = shallow(
      <SSHKeys
        {...pageyProps}
        classes={{
          sshKeysHeader: '',
          addNewWrapper: '',
          createdCell: '',
        }}
        data={undefined}
        error={[{ reason: 'error here' }]}
        timezone={'GMT'}
      />
    );

    expect(wrapper.find(`TableRowError`).exists()).toBeTruthy();
  });

  it('should display TableEmptyState if done loading and count is 0', () => {
    const wrapper = shallow(
      <SSHKeys
        {...pageyProps}
        classes={{
          sshKeysHeader: '',
          addNewWrapper: '',
          createdCell: '',
        }}
        data={undefined}
        timezone={'GMT'}
      />
    );

    expect(wrapper.find(`TableRowEmptyState`).exists()).toBeTruthy();
  });
});
