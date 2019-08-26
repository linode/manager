import { shallow, ShallowWrapper } from 'enzyme';
import { OAuthClient } from 'linode-js-sdk/lib/account';
import * as React from 'react';

import { pageyProps } from 'src/__data__/pageyProps';

import { clearDocs, setDocs } from 'src/store/documentation';

import { OAuthClients } from './OAuthClients';

describe('OAuth Clients', () => {
  const mockData: OAuthClient[] = [
    {
      public: false,
      id: 'test1',
      redirect_uri: 'http://localhost:3000',
      thumbnail_url: 'http://localhost:3000',
      label: 'test1',
      status: 'active'
    },
    {
      public: true,
      id: 'test2',
      redirect_uri: 'http://localhost:3000',
      thumbnail_url: 'http://localhost:3000',
      label: 'test2',
      status: 'active'
    },
    {
      public: false,
      id: 'test3',
      redirect_uri: 'http://localhost:3000',
      thumbnail_url: 'http://localhost:3000',
      label: 'test3',
      status: 'active'
    }
  ];

  let wrapper: ShallowWrapper;
  beforeEach(() => {
    wrapper = shallow(
      <OAuthClients
        classes={{ root: '', title: '' }}
        {...pageyProps}
        data={mockData}
        setDocs={setDocs}
        clearDocs={clearDocs}
      />
    );
  });

  it('should have a table header with 5 cells', () => {
    const tableHead = wrapper.find(
      'WithStyles(ForwardRef(TableHead))[data-qa-table-head]'
    );
    expect(tableHead.exists()).toBeTruthy();
    expect(tableHead.childAt(0).children().length).toEqual(5);
  });

  it('should have a table body', () => {
    expect(
      wrapper.find('WithStyles(ForwardRef(TableBody))').exists()
    ).toBeTruthy();
  });

  it('should have pagination controls', () => {
    expect(wrapper.find('WithStyles(PaginationFooter)').exists()).toBeTruthy();
  });

  it('should render a row for each client', () => {
    expect(
      wrapper.find('WithStyles(ForwardRef(TableBody))').children()
    ).toHaveLength(3);
  });

  it('should display label, access, id, and callback URL for a given client', () => {
    const testRow = wrapper.find(
      'WithStyles(withRouter(TableRow))[data-qa-table-row="test1"]'
    );
    expect(
      testRow
        .find('WithStyles(WrappedTableCell)[data-qa-oauth-label]')
        .children()
        .text()
    ).toEqual('test1');
    expect(
      testRow
        .find('WithStyles(WrappedTableCell)[data-qa-oauth-access]')
        .children()
        .text()
    ).toEqual('Private');
    expect(
      testRow
        .find('WithStyles(WrappedTableCell)[data-qa-oauth-id]')
        .children()
        .text()
    ).toEqual('test1');
    expect(
      testRow
        .find('WithStyles(WrappedTableCell)[data-qa-oauth-callback]')
        .children()
        .text()
    ).toEqual('http://localhost:3000');
  });

  it('should display TableRowError if error if state.error is set.', () => {
    wrapper.setProps({ error: Error('Test Error') });
    expect(wrapper.find(`TableRowError`).exists()).toBeTruthy();
  });

  it('should display TableEmptyState if done loading and there is no data', () => {
    wrapper.setProps({ loading: false, data: [] });
    expect(
      wrapper.find(`WithStyles(TableRowEmptyState)`).exists()
    ).toBeTruthy();
  });
});
