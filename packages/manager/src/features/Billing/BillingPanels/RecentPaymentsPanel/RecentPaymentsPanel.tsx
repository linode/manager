import { Account, getPayments, Payment } from 'linode-js-sdk/lib/account';
import { compose } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Notice from 'src/components/Notice';
import paginate, { PaginationProps } from 'src/components/Pagey';
import PaginationFooter from 'src/components/PaginationFooter';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import TableRowError from 'src/components/TableRowError';
import TableRowLoading from 'src/components/TableRowLoading';
import { printPayment } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';

type ClassNames = 'downloadButton';

const styles = (theme: Theme) =>
  createStyles({
    downloadButton: {
      background: 'none',
      color: theme.palette.primary.main,
      border: 'none',
      padding: 0,
      font: 'inherit',
      cursor: 'pointer',
      '&:hover': {
        textDecoration: 'underline'
      }
    }
  });

interface Props extends PaginationProps<Payment> {}

type CombinedProps = Props & StateProps & WithStyles<ClassNames>;

interface PdfGenerationError {
  itemId: number | undefined;
  error?: Error;
}

interface State {
  pdfGenerationError: PdfGenerationError;
}

class RecentPaymentsPanel extends React.Component<CombinedProps, State> {
  mounted: boolean = false;

  state: State = {
    pdfGenerationError: {
      itemId: undefined
    }
  };

  componentDidMount() {
    this.mounted = true;
    if (!this.props.account.data) {
      this.props.requestAccount();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { data, page, pageSize, count } = this.props;

    return (
      <ExpansionPanel onChange={this.handleExpansion} heading="Recent Payments">
        <Table aria-label="List of Recent Payments">
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
            eventCategory="recent payments panel"
          />
        )}
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const { data, error, loading } = this.props;

    if (loading) {
      return <TableRowLoading colSpan={3} />;
    }

    if (error) {
      return (
        <TableRowError
          colSpan={4}
          message="We were unable to load your payments."
        />
      );
    }

    return data && data.length > 0 ? (
      this.renderItems(data)
    ) : (
      <TableRowEmptyState colSpan={3} />
    );
  };

  renderItems = (items: Payment[]) => items.map(this.renderRow);

  printPayment(account: Account, item: Payment) {
    this.setState({
      pdfGenerationError: {
        itemId: undefined
      }
    });
    const result = printPayment(account, item);

    if (result.status === 'error') {
      this.setState({
        pdfGenerationError: {
          itemId: item.id,
          error: result.error
        }
      });
    }
  }

  renderRow = (item: Payment) => {
    const { account, classes } = this.props;
    const { pdfGenerationError } = this.state;

    return (
      <TableRow key={`payment-${item.id}`}>
        <TableCell parentColumn="Date Created">
          <DateTimeDisplay value={item.date} />
        </TableCell>
        <TableCell parentColumn="Description">Payment #{item.id}</TableCell>
        <TableCell parentColumn="Amount">
          <Currency quantity={Number(item.usd)} />
        </TableCell>
        <TableCell>
          {account.data && (
            <button
              role="button"
              onClick={() => this.printPayment(account.data as Account, item)}
              className={classes.downloadButton}
              title="Download PDF"
            >
              Download PDF
            </button>
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

  handleExpansion = (e: any, expanded: boolean) => {
    if (expanded && !this.props.data) {
      this.props.handleOrderChange('date', 'desc');
    }
  };
}

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

const updatedRequest = (ownProps: any, params: any) =>
  getPayments(params, { '+order_by': 'date', '+order': 'desc' }).then(
    response => response
  );

const paginated = paginate(updatedRequest);

const styled = withStyles(styles);

const enhanced = compose(
  connected,
  paginated,
  styled
);

export default enhanced(RecentPaymentsPanel);
