import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import { compose } from 'ramda';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
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
import { getInvoices } from 'src/services/account';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
});

interface Props extends PaginationProps<Linode.Invoice> {}

type CombinedProps = Props & WithStyles<ClassNames>;

class RecentInvoicesPanel extends React.Component<CombinedProps, {}> {
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
          />
        }
      </ExpansionPanel>
    );
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
    return (
      <TableRow key={`invoice-${item.id}`} rowLink={`/account/billing/invoices/${item.id}`} data-qa-invoice>
        <TableCell parentColumn="Date Created" data-qa-invoice-date><DateTimeDisplay value={item.date}/></TableCell>
        <TableCell parentColumn="Description" data-qa-invoice-desc><Link to={`/account/billing/invoices/${item.id}`}>Invoice #{item.id}</Link></TableCell>
        <TableCell parentColumn="Amount" data-qa-invoice-amount>${item.total}</TableCell>
      </TableRow>
    );
  };
}

const styled = withStyles(styles, { withTheme: true });

const updatedRequest = (ownProps: any, params: any, filters: any) => getInvoices(params, filters)
  .then((response) => response);

const paginated = paginate(updatedRequest);

const enhanced = compose(
  paginated,
  styled,
);

export default enhanced(RecentInvoicesPanel);
