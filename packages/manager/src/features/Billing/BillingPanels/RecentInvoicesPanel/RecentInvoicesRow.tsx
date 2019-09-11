import { Account, getInvoiceItems, Invoice, InvoiceItem } from 'linode-js-sdk/lib/account'
import * as React from 'react';
import { compose } from 'recompose';
import CircleProgress from 'src/components/CircleProgress';
import { makeStyles, Theme } from 'src/components/core/styles';
import Currency from 'src/components/Currency';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import Notice from 'src/components/Notice';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { getAll } from 'src/utilities/getAll';

const useStyles = makeStyles((theme: Theme) => ({
  linkContainer: {
    '& [role="progressbar"]': {
      width: '14px !important',
      height: '14px !important',
      padding: 0,
      position: 'relative',
      left: '20%'
    }
  }
}));

interface Props {
  invoice: Invoice;
  account: Account;
}

type CombinedProps = Props;

const RecentInvoicesRow: React.FC<CombinedProps> = props => {
  const { account, invoice } = props;
  const classes = useStyles();

  const [pdfError, setPDFError] = React.useState<Error | undefined>(undefined);
  const [isGeneratingPDF, setGeneratingPDF] = React.useState<boolean>(false);

  const _printInvoice = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    thisAccount: Account,
    thisItem: Invoice
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setPDFError(undefined);
    setGeneratingPDF(true);

    getAll<InvoiceItem>((params, filter) =>
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
      rowLink={
        !isGeneratingPDF ? `/account/billing/invoices/${invoice.id}` : undefined
      }
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
          <div className={classes.linkContainer}>
            {!isGeneratingPDF ? (
              <a
                href="#"
                onClick={e =>
                  _printInvoice(e, account as Account, invoice)
                }
                className="secondaryLink"
              >
                Download PDF
              </a>
            ) : (
                <CircleProgress mini />
              )}
          </div>
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

export default compose<CombinedProps, Props>(React.memo)(RecentInvoicesRow);
