import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import {
  Account,
  getInvoice,
  getInvoiceItems,
  Invoice,
  InvoiceItem
} from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import IconButton from 'src/components/IconButton';
import Notice from 'src/components/Notice';
import withFlags, {
  FeatureFlagConsumerProps
} from 'src/containers/withFeatureFlagConsumer.container';
import { printInvoice } from 'src/features/Billing/PdfGenerator/PdfGenerator';
import createMailto from 'src/features/Footer/createMailto';
import { ApplicationState } from 'src/store';
import { requestAccount } from 'src/store/account/account.requests';
import { ThunkDispatch } from 'src/store/types';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { getAll } from 'src/utilities/getAll';
import InvoiceTable from './InvoiceTable';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`
  },
  totals: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'right',
    '& h2': {
      margin: theme.spacing(1)
    }
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34
    }
  },
  m2: {
    margin: theme.spacing()
  }
}));

type CombinedProps = RouteComponentProps<{ invoiceId: string }> &
  StateProps &
  FeatureFlagConsumerProps;

export const InvoiceDetail: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { data } = props;

  const [invoice, setInvoice] = React.useState<Invoice | undefined>(undefined);
  const [items, setItems] = React.useState<InvoiceItem[] | undefined>(
    undefined
  );
  const [loading, setLoading] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>();
  const [pdfGenerationError, setPDFGenerationError] = React.useState<any>(
    undefined
  );
  const [isNegative, setIsNegative] = React.useState<boolean>(false);

  const requestData = () => {
    const {
      match: {
        params: { invoiceId }
      },
      data
    } = props;
    setLoading(true);

    if (!data) {
      props.requestAccount();
    }

    const getAllInvoiceItems = getAll<InvoiceItem>((params, filter) =>
      getInvoiceItems(+invoiceId, params, filter)
    );

    Promise.all([getInvoice(+invoiceId), getAllInvoiceItems()])
      .then(([invoice, { data: items }]) => {
        setLoading(false);
        setInvoice(invoice);
        setItems(items);
        setIsNegative(invoice.total < 0);
      })
      .catch(errorResponse => {
        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'Unable to retrieve invoice details. '
          )
        );
      });
  };

  React.useEffect(() => {
    requestData();
  }, []);

  const printInvoicePDF = (
    account: Account,
    invoice: Invoice,
    items: InvoiceItem[]
  ) => {
    const taxBanner = props.flags.taxBanner;
    const result = printInvoice(account, invoice, items, taxBanner);

    setPDFGenerationError(result.status === 'error' ? result.error : undefined);
  };

  return (
    <Paper className={classes.root}>
      <Grid container>
        <Grid item xs={12}>
          <Grid container justify="space-between">
            <Grid item className={classes.titleWrapper} style={{ flex: 1 }}>
              <Link to={`/account/billing`}>
                <IconButton
                  className={classes.backButton}
                  data-qa-back-to-billing
                >
                  <KeyboardArrowLeft />
                </IconButton>
              </Link>
              {invoice && (
                <Typography variant="h2" data-qa-invoice-id>
                  Invoice #{invoice.id}
                </Typography>
              )}
            </Grid>
            <Grid
              item
              className={classes.titleWrapper}
              data-qa-printable-invoice
            >
              {data && invoice && items && (
                <Button
                  buttonType="primary"
                  onClick={() => printInvoicePDF(data, invoice, items)}
                >
                  Download PDF
                </Button>
              )}
            </Grid>
            <Grid item className={`${classes.titleWrapper} ${classes.m2}`}>
              {invoice && (
                <Typography variant="h2" data-qa-total={invoice.total}>
                  Total:{' '}
                  {isNegative
                    ? '-($' + Number(invoice.total * -1).toFixed(2) + ')'
                    : '$' + Number(invoice.total).toFixed(2)}
                </Typography>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {pdfGenerationError && (
            <Notice
              error={true}
              html={`Failed generating PDF. <a href="${createMailto(
                pdfGenerationError.stack
              )}"
          > Send report</a>`}
            />
          )}
          <InvoiceTable
            loading={loading}
            items={items}
            errors={errors}
            isNegative={isNegative}
          />
        </Grid>
        <Grid item xs={12}>
          {invoice && (
            <Grid container justify="flex-end">
              <Grid item className={classes.totals}>
                <Typography variant="h2">
                  Subotal:{' '}
                  {isNegative
                    ? '-($' + Number(invoice.subtotal * -1).toFixed(2) + ')'
                    : '$' + Number(invoice.subtotal).toFixed(2)}
                </Typography>
                <Typography variant="h2">
                  Tax:{' '}
                  {isNegative
                    ? '-($' + Number(invoice.tax * -1).toFixed(2) + ')'
                    : '$' + Number(invoice.tax).toFixed(2)}
                </Typography>
                <Typography variant="h2">
                  Total:{' '}
                  {isNegative
                    ? '-($' + Number(invoice.total * -1).toFixed(2) + ')'
                    : '$' + Number(invoice.total).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

type S = ApplicationState['__resources']['account'];

interface StateProps extends S {
  requestAccount: () => void;
}

const connected = connect(
  (state: ApplicationState): S => state.__resources.account,
  (dispatch: ThunkDispatch): { requestAccount: () => void } => ({
    requestAccount: () => dispatch(requestAccount())
  })
);

const enhanced = compose<CombinedProps, {}>(connected, withRouter, withFlags);

export default enhanced(InvoiceDetail);
