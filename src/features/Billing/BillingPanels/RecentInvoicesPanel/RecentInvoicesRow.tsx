import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { getInvoiceItems } from 'src/services/account';
import { getAll } from 'src/utilities/getAll';

type ClassNames = 'root' | 'button';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    button: {
      padding: 0
    }
  });

interface Props {
  invoice: Linode.Invoice;
  account: Linode.Account;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const RecentInvoicesRow: React.FC<CombinedProps> = props => {
  const { account, classes, invoice } = props;

  const [pdfError, setPDFError] = React.useState<Error | undefined>(undefined);
  const [isGeneratingPDF, setGeneratingPDF] = React.useState<boolean>(false);

  const _printInvoice = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    thisAccount: Linode.Account,
    thisItem: Linode.Invoice
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setPDFError(undefined);
    setGeneratingPDF(true);

    getAll<Linode.InvoiceItem>((params, filter) =>
      getInvoiceItems(invoice.id, params, filter)
    )()
      .then(response => {
        const invoiceItems = response.data;
        const result = printInvoice(thisAccount, thisItem, invoiceItems);
        setGeneratingPDF(false);

        if (result.status === 'error') {
          setPDFError(result.error);
        }
      })
      .catch(e => {
        setPDFError(e);
        setGeneratingPDF(false);
      });
  };

  return (
    <TableRow
      key={`invoice-${invoice.id}`}
      rowLink={`/account/billing/invoices/${invoice.id}`}
      data-qa-invoice
    >
      <TableCell parentColumn="Date Created" data-qa-invoice-date>
        <DateTimeDisplay value={invoice.date} />
      </TableCell>
      <TableCell parentColumn="Description" data-qa-invoice-desc={invoice.id}>
        Invoice #{invoice.id}
      </TableCell>
      <TableCell parentColumn="Amount" data-qa-invoice-amount>
        <Currency quantity={Number(invoice.total)} />
      </TableCell>
      <TableCell>
        {account && (
          <Button
            className={classes.button}
            onClick={e => _printInvoice(e, account as Linode.Account, invoice)}
            loading={isGeneratingPDF}
          >
            Download PDF
          </Button>
        )}
        {pdfError && (
          <Notice
            error={true}
            html={`Failed generating PDF. <a href="${createMailto(
              pdfError && pdfError.stack
            )}"
          > Send report</a>`}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

const styled = withStyles(styles);

export default compose<CombinedProps, Props>(
  styled,
  React.memo
)(RecentInvoicesRow);
