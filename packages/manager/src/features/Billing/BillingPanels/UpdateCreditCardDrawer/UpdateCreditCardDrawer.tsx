import { saveCreditCard } from 'linode-js-sdk/lib/account';
import { APIError } from 'linode-js-sdk/lib/types';
import { range, take, takeLast } from 'ramda';
import * as React from 'react';
import NumberFormat from 'react-number-format';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Drawer from 'src/components/Drawer';
import { makeStyles, Theme } from 'src/components/core/styles';
import Grid from 'src/components/Grid';
import NativeSelect from 'src/components/NativeSelect';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import accountContainer, {
  Props as AccountContainerProps
} from 'src/containers/account.container';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import isCreditCardExpired from 'src/utilities/isCreditCardExpired';

const useStyles = makeStyles((theme: Theme) => ({
  root: {},
  expired: {
    color: theme.color.red
  },
  currentccContainer: {
    padding: `${theme.spacing(2)}px 0 ${theme.spacing(4)}px`
  },
  newccContainer: {
    padding: `${theme.spacing(1)}px 0 0`
  },
  currentCCTitle: {
    marginBottom: theme.spacing(1)
  },
  card_number: {
    minWidth: 225
  },
  fullWidthMobile: {
    flexBasis: '50%',
    [theme.breakpoints.down('xs')]: {
      width: '100%'
    }
  }
}));

export interface Props {
  open: boolean;
  onClose: () => void;
}

type CombinedProps = Props & AccountContainerProps;

export const UpdateCreditCardDrawer: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { onClose, open } = props;

  const currentYear = new Date().getFullYear();

  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<APIError[] | undefined>(undefined);
  const [success, setSuccess] = React.useState<boolean>();
  const [card_number, set_card_number] = React.useState<string>('');
  const [expiry_date] = React.useState<string>('');
  const [expiry_month, set_expiry_month] = React.useState<number>(1);
  const [expiry_year, set_expiry_year] = React.useState<number>(currentYear);
  const [cvv, setCVV] = React.useState<string>('');

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_card_number(e.target.value ? take(19, e.target.value) : '');
  };

  const HandleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    console.log(date);
  };

  const handleExpiryMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_expiry_month(+e.target.value);
  };

  const handleExpiryYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    set_expiry_year(+e.target.value);
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // All characters except numbers
    const regex = /(([\D]))/;

    // Prevents more than 4 characters from being submitted
    const cvv = e.target.value.slice(0, 4);
    setCVV(cvv.replace(regex, ''));
  };

  const submitForm = () => {
    setSubmitting(true);
    setErrors(undefined);

    saveCreditCard({ card_number, expiry_month, expiry_year, cvv })
      .then(() => {
        const credit_card = {
          last_four: takeLast(4, card_number),
          expiry: `${String(expiry_month).padStart(2, '0')}/${expiry_year}`,
          cvv
        };
        // Update Redux store so subscribed components will display updated
        // information.
        props.saveCreditCard(credit_card);

        props.updateAccount({
          credit_card
        });
        set_card_number('');
        set_expiry_month(1);
        set_expiry_year(currentYear);
        setCVV('');
        setSubmitting(false);
        setSuccess(true);
      })
      .catch(error => {
        setSubmitting(false);
        setErrors(getAPIErrorOrDefault(error, 'Unable to update credit card.'));
      });
  };

  const resetForm = () => {
    set_card_number('');
    setErrors(undefined);
    set_expiry_month(1);
    set_expiry_year(currentYear);
    setSuccess(undefined);
    setCVV('');
  };

  const creditCardField = (props: any) => {
    const { inputRef, onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={inputRef}
        onValueChange={values => {
          onChange({
            target: {
              value: values.value
            }
          });
        }}
        format="#### #### #### #######"
      />
    );
  };

  const { accountData } = props;

  if (!accountData) {
    return null;
  } // Temporary; remove when refactoring to a drawer.

  // const { expiry, last_four } = accountData.credit_card;
  const hasErrorFor = getAPIErrorFor(
    {
      card_number: 'card number',
      expiry_month: 'expiration month',
      expiry_year: 'expiration year',
      cvv: 'cvv code'
    },
    errors
  );
  const generalError = hasErrorFor('none');

  const yearMenuItems = range(currentYear, currentYear + 20).map((v: any) => {
    return { label: v, value: v };
  });

  const monthMenuItems = range(1, 13).map((v: any) => {
    const label = String(v).padStart(2, '0');
    return { label, value: v };
  });

  return (
    <Drawer title="Edit Credit Card" open={open} onClose={onClose}>
      <Grid container>
        {/* {last_four && (
          <Grid item xs={12}>
            <div className={classes.currentccContainer}>
              <Typography variant="h2" className={classes.currentCCTitle}>
                Current Credit Card
              </Typography>
              <Grid container>
                <Grid item>
                  <Typography>
                    Exp Date:&nbsp;
                    {expiry}
                    {isCreditCardExpired(expiry) && (
                      <span className={classes.expired}>{` Expired`}</span>
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </div>
            <Divider />
          </Grid>
        )} */}
        <Grid item xs={12}>
          <div className={classes.newccContainer}>
            {generalError && (
              <Notice error spacingTop={24} spacingBottom={8}>
                {generalError}
              </Notice>
            )}
            {success && (
              <Notice success spacingTop={24} spacingBottom={8}>
                Credit card successfully updated.
              </Notice>
            )}
            <Grid container>
              <Grid item xs={12}>
                <TextField
                  // required
                  label="Credit Card Number"
                  value={card_number}
                  onChange={handleCardNumberChange}
                  errorText={hasErrorFor('card_number')}
                  className={classes.card_number}
                  InputProps={{
                    inputComponent: creditCardField
                  }}
                />
              </Grid>
              <Grid item className={classes.fullWidthMobile}>
                <TextField
                  // required
                  label="Expiration Date"
                  value={expiry_date}
                  onChange={HandleExpiryDateChange}
                  errorText={hasErrorFor('expiry_date')}
                  // InputProps={{
                  //   inputComponent: expiryDate
                  // }}
                  placeholder={'MM / YYYY'}
                />
              </Grid>
              {/* <Grid item className={classes.fullWidthMobile}>
                <NativeSelect
                  label="Expiration Month"
                  onChange={handleExpiryMonthChange}
                  errorText={hasErrorFor('expiry_month')}
                  value={expiry_month}
                  options={monthMenuItems}
                />
              </Grid>
              <Grid item className={classes.fullWidthMobile}>
                <NativeSelect
                  label="Expiration Year"
                  onChange={handleExpiryYearChange}
                  errorText={hasErrorFor('expiry_year')}
                  value={expiry_year}
                  options={yearMenuItems}
                />
              </Grid> */}
              <Grid item className={classes.fullWidthMobile}>
                <TextField
                  // required
                  label="CVV"
                  value={cvv}
                  onChange={handleCVVChange}
                  errorText={hasErrorFor('cvv')}
                />
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
      <ActionsPanel>
        <Button buttonType="primary" onClick={submitForm} loading={submitting}>
          Save
        </Button>
        <Button buttonType="cancel" onClick={onClose}>
          Cancel
        </Button>
      </ActionsPanel>
    </Drawer>
  );
};

const enhanced = compose<CombinedProps, {}>(accountContainer());

export default enhanced(UpdateCreditCardDrawer) as React.ComponentType<{}>;
