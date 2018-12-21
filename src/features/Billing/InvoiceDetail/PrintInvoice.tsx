import { pathOr } from 'ramda';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import Logo from 'src/assets/logo/logo-text.svg';
import CircleProgress from 'src/components/CircleProgress';
import Paper from 'src/components/core/Paper';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay/DateTimeDisplay';
import Grid from 'src/components/Grid';
import LinodeThemeWrapper from 'src/LinodeThemeWrapper';
import { getInvoice, getInvoiceItems } from 'src/services/account';
import { async } from 'src/store/reducers/resources/account';
import InvoiceTable from './InvoiceTable';

type ClassNames = 'root' | 'backButton' | 'titleWrapper' | 'logoWrapper' | 'invoiceHeader';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px`,
    '@media print': {
      backgroundColor: 'transparent !important',
    },
  },
  logoWrapper: {
    textAlign: 'center',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  backButton: {
    margin: '5px 0 0 -16px',
    '& svg': {
      width: 34,
      height: 34,
    },
  },
  invoiceHeader: {
    marginBottom: 25,
  }
});

interface State {
  invoice?: Linode.Invoice;
  items?: Linode.InvoiceItem[];
  loading: boolean;
  errors?: Linode.ApiFieldError[];
}



type CombinedProps =
  & RouteComponentProps<{ invoiceId: number }>
  & StateProps
  & WithStyles<ClassNames>;

class PrintInvoice extends React.Component<CombinedProps, State> {
  state: State = {
    loading: false,
  };

  mounted: boolean = false;

  requestData = () => {
    const { match: { params: { invoiceId } } } = this.props;
    this.setState({ loading: true });

    Promise.all([
      getInvoice(invoiceId),
      getInvoiceItems(invoiceId),
    ]).then(([invoice, { data: items }]) => {
      this.setState({
        loading: false,
        invoice,
        items,
      })
    })
      .catch((error) => {
        this.setState({
          errors: pathOr([{ reason: 'Unable to retrieve invoice details. ' }], ['response', 'data', 'errors'], error),
        })
      });
  };

  componentDidMount() {
    this.mounted = true;
    this.requestData();
    this.props.requestAccount();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    const { classes, data, loading: accountLoading } = this.props;
    const { invoice, loading, errors, items } = this.state;

    if (loading || accountLoading || !data || !invoice) {
      return (
        <LinodeThemeWrapper>
          <CircleProgress />
        </LinodeThemeWrapper>
      );
    }

    const date = <DateTimeDisplay format={`YYYY-MM-DD`} value={invoice.date} timezone={'EST'} />;
    const { address_1, address_2, city, company, country, first_name, last_name, state, zip } = data;

    return (
      <LinodeThemeWrapper>
        <Paper className={classes.root}>
          <Grid container>
            <Grid item xs={12} className={classes.logoWrapper}>
              <Logo width={115} height={43} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant='body2'>Invoice Date: {date}</Typography>
              <Typography variant="subtitle1">Remit To:</Typography>
              <Typography variant='body2'>Linode, LLC</Typography>
              <Typography variant='body2'>249 Arch St.</Typography>
              <Typography variant='body2'>Philadelphia, PA 19106</Typography>
              <Typography variant='body2'>USA</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Invoice To:</Typography>
              <Typography variant='body2'>{first_name} {last_name}</Typography>
              <Typography variant='body2'>{company}</Typography>
              <Typography variant='body2'>{address_1}</Typography>
              <Typography variant='body2'>{address_2}</Typography>
              <Typography variant='body2'>{city},{state}, {zip}, {country}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h3' className={classes.invoiceHeader}>Invoice: #{invoice.id}</Typography>
              <InvoiceTable loading={false} items={items} errors={errors} />
            </Grid>
            <Grid item xs={12}>
              <Grid container justify="space-between">
                <Grid item className={classes.titleWrapper} />
                <Grid item className={classes.titleWrapper}>
                  {invoice && <Typography role="header" variant="h2">Total ${Number(invoice.total).toFixed(2)}</Typography>}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </LinodeThemeWrapper>
    );
  }
}

type S = ApplicationState['__resources']['account'];

interface StateProps extends S {
  requestAccount: () => void;
}

const connected = connect(
  (state: ApplicationState): S => state.__resources.account,
  (dispatch): { requestAccount: () => void; } => ({ requestAccount: () => dispatch(async.requestAccount()) }));

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, {}>(connected, styled, withRouter);

export default enhanced(PrintInvoice);

