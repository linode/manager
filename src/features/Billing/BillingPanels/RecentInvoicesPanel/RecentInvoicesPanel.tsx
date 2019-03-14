import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { getInvoiceItems, getInvoices } from 'src/services/account';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {}
});

interface Props extends PaginationProps<Linode.Invoice> {}

type CombinedProps = Props & WithStyles<ClassNames> & StateProps;

interface PdfGenerationError {
  itemId: number | undefined;
  error?: any;
}

interface State {
  pdfGenerationError: PdfGenerationError;
  loading: boolean;
}

class RecentInvoicesPanel extends React.Component<CombinedProps, State> {
  state: State = {
    pdfGenerationError: {
      itemId: undefined
    },
    loading: false
  };

  componentDidMount() {
    if (!this.props.account.data) {
      this.props.requestAccount();
    }
  }

  setPdfError(itemId: number | undefined, error?: any) {
    this.setState({
      pdfGenerationError: {
        itemId,
        error
      }
    });
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

  printInvoice(event: any, account: Linode.Account, item: Linode.Invoice) {
    event.preventDefault();
    event.stopPropagation();
    this.setPdfError(undefined);

    getInvoiceItems(item.id)
      .then(response => {
        const invoiceItems = response.data;
        const result = printInvoice(account, item, invoiceItems);

        if (result.status === 'error') {
          this.setPdfError(item.id, result.error);
        }
      })
      .catch(e => {
        this.setPdfError(item.id, e);
      });
  }

  renderContent = () => {
    const { data, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={4} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={4}
          message="We were unable to load your invoices."
        />
      );
    }

    return data && data.length > 0 ? (
      this.renderItems(data)
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

  renderItems = (items: Linode.Invoice[]) => items.map(this.renderRow);

  renderRow = (item: Linode.Invoice) => {
    const { pdfGenerationError } = this.state;
    const { account } = this.props;

    return (
      <TableRow
        key={`invoice-${item.id}`}
        rowLink={`/account/billing/invoices/${item.id}`}
        data-qa-invoice
      >
        <TableCell parentColumn="Date Created" data-qa-invoice-date>
          <DateTimeDisplay value={item.date} />
        </TableCell>
        <TableCell parentColumn="Description" data-qa-invoice-desc={item.id}>
          Invoice #{item.id}
        </TableCell>
        <TableCell parentColumn="Amount" data-qa-invoice-amount>
          <Currency quantity={Number(item.total)} />
        </TableCell>
        <TableCell>
          {account.data && (
            <a
              href="#"
              onClick={e =>
                this.printInvoice(e, account.data as Linode.Account, item)
              }
            >
              Download PDF
            </a>
          )}
          {pdfGenerationError.itemId === item.id && (
            <Notice
              error={true}
              html={`Failed generating PDF. <a href="${createMailto(
                pdfGenerationError.error && pdfGenerationError.error.stack
              )}"
            > Send report</a>`}
            />
          )}
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
  (state: ApplicationState): S => ({ account: state.__resources.account }),
  (dispatch: ThunkDispatch): { requestAccount: () => void } => ({
    requestAccount: () => dispatch(requestAccount())
  })
);

const updatedRequest = (ownProps: any, params: any, filters: any) =>
  getInvoices(params, filters).then(response => response);

const paginated = paginate(updatedRequest);

const enhanced = compose(
  connected,
  paginated,
  styled
);

export default enhanced(RecentInvoicesPanel);
