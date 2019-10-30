import { shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import objectStorageKeys from 'src/__data__/objectStorageKeys';
import { pageyProps } from 'src/__data__/pageyProps';
import { AccessKeyTable, CombinedProps } from './AccessKeyTable';

describe('ObjectStorageKeyTable', () => {
  let wrapper: ShallowWrapper<CombinedProps>;

  beforeEach(() => {
    wrapper = shallow<CombinedProps>(
      <AccessKeyTable
        classes={{
          root: '',
          headline: '',
          paper: '',
          labelCell: '',
          copyIcon: ''
        }}
        openDrawerForEditing={jest.fn()}
        openRevokeDialog={jest.fn()}
        isRestrictedUser={false}
        {...pageyProps}
      />
    );
  });

  it('it includes a header with "Label" and "Access Key" cells', () => {
    // Expect "3" here, because there is an empty table cell for the kebab menu
    expect(wrapper.find('[data-qa-table-head]').children().length).toBe(3);
    expect(
      wrapper
        .find('[data-qa-header-label]')
        .childAt(0)
        .text()
    ).toBe('Label');
    expect(
      wrapper
        .find('[data-qa-header-key]')
        .childAt(0)
        .text()
    ).toBe('Access Key');
  });

  it('returns a loading state when loading', () => {
    wrapper.setProps({ loading: true });
    expect(wrapper.find('WithStyles(tableRowLoading)')).toHaveLength(1);
  });

  it('returns an error state when there is an error', () => {
    wrapper.setProps({ error: [{ reason: 'hello world' }] });
    expect(wrapper.find('TableRowError')).toHaveLength(1);
    expect(wrapper.find('TableRowError').prop('message')).toBe(
      'We were unable to load your Access Keys.'
    );
  });

  it('returns an empty state if there is no data', () => {
    expect(wrapper.find('WithStyles(TableRowEmptyState)')).toHaveLength(1);
  });

  it('returns rows for each key', () => {
    wrapper.setProps({ data: objectStorageKeys });
    objectStorageKeys.forEach(key => {
      expect(wrapper.find(`[data-qa-table-row="${key.label}"]`)).toBeDefined();
    });
  });
});
