import { Account, getInvoices, Invoice } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { compose, pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import ExpansionPanel from 'src/components/ExpansionPanel';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';

import RecentInvoiceRow from './RecentInvoicesRow';

type CombinedProps = PaginationProps<Invoice> & StateProps;

interface State {
  loading: boolean;
}

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false
  };

  componentDidMount() {
    if (!this.props.account) {
      this.props.requestAccount();
    }
  }

  render() {
    const { data, page, pageSize, count } = this.props;

    return (
      <ExpansionPanel heading="Recent Invoices" onChange={this.handleExpansion}>
        <Table aria-label="List of Recent Invoices">
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>{this.renderContent()}</TableBody>
        </Table>
        {data && data.length > 0 && (
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.props.handlePageChange}
            handleSizeChange={this.props.handlePageSizeChange}
            eventCategory="recent invoices panel"
          />
        )}
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const {
      data,
      error,
      loading,
      account,
      accountLoading,
      accountError
    } = this.props;

    if (loading || accountLoading) {
      return <TableRowLoading colSpan={4} />;
    }

    if (error || accountError) {
      return (
        <TableRowError
          colSpan={4}
          message="We were unable to load your invoices."
        />
      );
    }

    return data && data.length > 0 && account ? (
      data.map((eachInvoice, index) => (
        <RecentInvoiceRow key={index} invoice={eachInvoice} account={account} />
      ))
    ) : (
      <TableRowEmptyState colSpan={4} />
    );
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.props.data) {
      this.setState({ loading: true });
      this.props.handleOrderChange('date', 'desc');
    }
  };
}

interface ReduxState {
  account?: Account;
  accountLoading: boolean;
  accountError?: APIError[] | Error;
}

interface StateProps extends ReduxState {
  requestAccount: () => void;
}

const connected = connect(
  (state: ApplicationState): ReduxState => ({
    account: state.__resources.account.data,
    accountLoading: pathOr(false, ['__resources', 'account', 'loading'], state),
    accountError: state.__resources.account.error.read
  }),
  (dispatch: ThunkDispatch): { requestAccount: () => void } => ({
    requestAccount: () => dispatch(requestAccount())
  })
);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getInvoices(params, filters).then(response => response);

const paginated = paginate(updatedRequest);

const enhanced = compose(
  connected,
  paginated
);

export default enhanced(RecentInvoicesPanel);
