import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { reportException } from 'src/exceptionReporting';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import { ThunkDispatch } from 'src/store/types';

import { getInvoices } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props extends PaginationProps<Linode.Invoice> {}

type CombinedProps = Props & WithStyles<ClassNames> & StateProps;

interface PdfGenerationError {
  itemId: number | undefined
}

interface State {
  pdfGenerationError: PdfGenerationError
}

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  
  state: State = {
    pdfGenerationError: {
      itemId: undefined
    }
  }

  componentDidMount() {
    if (!this.props.account.data) {
      this.props.requestAccount();
    }
  }

  render() {
    const {
      data,
      page,
      pageSize,
      count,
    } = this.props;

    return (
      <ExpansionPanel
        heading="Recent Invoices"
        onChange={this.handleExpansion}
      >
        <Table aria-label="List of Recent Invoices">
          <TableHead>
            <TableRow>
              <TableCell>Date Created</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            { this.renderContent() }
          </TableBody>
        </Table>
        {data && data.length > 0 &&
          <PaginationFooter
            count={count}
            page={page}
            pageSize={pageSize}
            handlePageChange={this.props.handlePageChange}
            handleSizeChange={this.props.handlePageSizeChange}
            eventCategory="recent invoices panel"
          />
        }
      </ExpansionPanel>
    );
  }

  printInvoice(account: Linode.Account, item: Linode.Payment) {
    this.setState({
      pdfGenerationError: {
        itemId: undefined
      }
    });
    try {
      printInvoice(account, item);
    } catch (e) {
      reportException(
        Error('Error while generating PDF.'),
        e
      );
      this.setState({
        pdfGenerationError: {
          itemId: item.id
        }
      });
    }

  }

  renderContent = () => {
    const { data, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={4} />
    }

    if (error) {
      return <TableRowError colSpan={4} message="We were unable to load your invoices." />
    }

    return data && data.length > 0 ? this.renderItems(data) : <TableRowEmptyState colSpan={4} />
  };

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.props.data) {
      this.setState({ loading: true });
      this.props.handleOrderChange('date', 'desc');
    }
  };

  renderItems = (items: Linode.Invoice[]) => items.map(this.renderRow);

  renderRow = (item: Linode.Invoice) => {
    const { pdfGenerationError } = this.state;

    return (
      <TableRow key={`invoice-${item.id}`} rowLink={`/account/billing/invoices/${item.id}`} data-qa-invoice>
        <TableCell parentColumn="Date Created" data-qa-invoice-date><DateTimeDisplay value={item.date}/></TableCell>
        <TableCell parentColumn="Description" data-qa-invoice-desc={item.id}><Link to={`/account/billing/invoices/${item.id}`}>Invoice #{item.id}</Link></TableCell>
        <TableCell parentColumn="Amount" data-qa-invoice-amount>${item.total}</TableCell>
        <TableCell>
          {account.data && <a href="#" target="_blank" onClick={() => this.printPayment(account.data as Linode.Account, item)}>Download PDF</a>}
          {pdfGenerationError.itemId === item.id && <Notice error={true} text="Failed generating PDF." />}
        </TableCell>
      </TableRow>
    );
  };
}

const styled = withStyles(styles);

interface S {
  account: ApplicationState['__resources']['account'];
}

interface StateProps extends S {
  requestAccount: () => void;
}

const connected = connect(
  (state: ApplicationState): S => ({account: state.__resources.account}),
  (dispatch: ThunkDispatch): { requestAccount: () => void; } => ({ requestAccount: () => dispatch(requestAccount()) }));

const updatedRequest = (ownProps: any, params: any, filters: any) => getInvoices(params, filters)
  .then((response) => response);

const paginated = paginate(updatedRequest);

const enhanced = compose(
  connected,
  paginated,
  styled,
);

export default enhanced(RecentInvoicesPanel);
