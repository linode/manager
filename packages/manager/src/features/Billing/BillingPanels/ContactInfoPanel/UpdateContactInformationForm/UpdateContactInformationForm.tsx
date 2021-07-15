import { updateAccountInfo } from '@linode/api-v4';
import { Account } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import countryData from 'country-region-data';
import { defaultTo, lensPath, set } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  createStyles,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { queryClient } from 'src/queries/base';
import withNotifications, {
  WithNotifications,
} from 'src/store/notification/notification.containers';
import composeState from 'src/utilities/composeState';
import { getErrorMap } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { Country } from './types';

type ClassNames = 'mainFormContainer' | 'actions';

const styles = () =>
  createStyles({
    mainFormContainer: {
      maxWidth: 860,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
    },
  });

interface Props {
  onClose: () => void;
  open: boolean;
  focusEmail: boolean;
}

interface State {
  submitting: boolean;
  success?: string;
  fields: Partial<Account>;
  errResponse: APIError[] | undefined;
}

type CombinedProps = Props & WithStyles<ClassNames> & WithNotifications;

const field = (path: string[]) => lensPath(['fields', ...path]);

const L = {
  fields: {
    address_1: field(['address_1']),
    address_2: field(['address_2']),
    city: field(['city']),
    company: field(['company']),
    email: field(['email']),
    first_name: field(['first_name']),
    last_name: field(['last_name']),
    phone: field(['phone']),
    tax_id: field(['tax_id']),
    zip: field(['zip']),
    country: field(['country']),
    state: field(['state']),
  },
};

class UpdateContactInformationForm extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    submitting: false,
    fields: {},
    errResponse: undefined,
  };

  composeState = composeState;

  emailRef = React.createRef<HTMLInputElement>();

  async componentDidMount() {
    const account = queryClient.getQueryData<Account>('account');

    const accountWithoutCard: Partial<Account> = {
      ...account,
      credit_card: undefined,
    };

    if (account) {
      this.setState({ fields: accountWithoutCard });
    }

    // Auto-focus the "Email" field if appropriate (if the user is here via
    // "billing_bounce_notification"). We also have to set field state so that
    // if the user clicks "Submit" without changing anything, we include the
    // "email" field in the PUT request (this is the same as "Confirming" the
    // email address is correct).
    if (this.props.focusEmail && this.emailRef.current) {
      this.emailRef.current.focus();
      this.emailRef.current.scrollIntoView();
      this.setState({
        fields: { ...this.state.fields, email: account?.email },
      });
    }
  }

  render() {
    if (!this.state.fields) {
      return null;
    }

    return (
      <form>
        {this.renderForm(this.state.fields as Account)}
        {this.renderFormActions()}
      </form>
    );
  }

  renderForm = (account: Account) => {
    const { classes } = this.props;
    const { fields, success } = this.state;

    const errorMap = getErrorMap(
      [
        'address_1',
        'address_2',
        'city',
        'country',
        'company',
        'email',
        'first_name',
        'last_name',
        'phone',
        'state',
        'tax_id',
        'zip',
      ],
      this.state.errResponse
    );

    const generalError = errorMap.none;

    const countryResults: Item<string>[] = countryData.map(
      (country: Country) => {
        return {
          value: country.countryShortCode,
          label: country.countryName,
        };
      }
    );

    // const currentCountryResult = countryData.filter((country: Country) =>
    //   fields.country
    //     ? country.countryShortCode === fields.country
    //     : country.countryShortCode === account.country
    // );

    // const countryRegions: Region[] = pathOr(
    //   [],
    //   ['0', 'regions'],
    //   currentCountryResult
    // );

    // const regionResults = countryRegions.map(region => {
    //   return {
    //     value: region.name,
    //     label: region.name
    //   };
    // });

    return (
      <Grid
        container
        className={classes.mainFormContainer}
        data-qa-update-contact
      >
        {generalError && (
          <Grid item xs={12}>
            <Notice error text={generalError} />
          </Grid>
        )}
        {success && (
          <Grid item xs={12}>
            <Notice success text={success} />
          </Grid>
        )}

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[
            account.first_name,
            fields.first_name,
            errorMap.first_name,
            classes,
          ]}
        >
          <TextField
            label="First Name"
            value={defaultTo(account.first_name, fields.first_name)}
            errorText={errorMap.first_name}
            onChange={this.updateFirstName}
            data-qa-contact-first-name
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[
            account.last_name,
            fields.last_name,
            errorMap.last_name,
            classes,
          ]}
        >
          <TextField
            label="Last Name"
            value={defaultTo(account.last_name, fields.last_name)}
            errorText={errorMap.last_name}
            onChange={this.updateLastName}
            data-qa-contact-last-name
          />
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[
            account.company,
            fields.company,
            errorMap.company,
            classes,
          ]}
        >
          <Grid container>
            <Grid item xs={12}>
              <TextField
                label="Company Name"
                value={defaultTo(account.company, fields.company)}
                errorText={errorMap.company}
                onChange={this.updateCompany}
                data-qa-company
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[
            account.address_1,
            fields.address_1,
            errorMap.address_1,
            classes,
          ]}
        >
          <TextField
            label="Address"
            value={defaultTo(account.address_1, fields.address_1)}
            errorText={errorMap.address_1}
            onChange={this.updateAddress1}
            data-qa-contact-address-1
          />
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[
            account.address_2,
            fields.address_2,
            errorMap.address_2,
            classes,
          ]}
        >
          <TextField
            label="Address 2"
            value={defaultTo(account.address_2, fields.address_2)}
            errorText={errorMap.address_2}
            onChange={this.updateAddress2}
            data-qa-contact-address-2
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[account.city, fields.city, errorMap.city, classes]}
        >
          <TextField
            label="City"
            value={defaultTo(account.city, fields.city)}
            errorText={errorMap.city}
            onChange={this.updateCity}
            data-qa-contact-city
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[
            fields.state,
            fields.zip,
            fields.country,
            errorMap.state,
            errorMap.zip,
            errorMap.country,
            classes,
          ]}
        >
          {/*
                @todo use the <EnhancedSelect /> in favor of the
                <TextField /> when the DB and API remove the 24 character limit.

                The issue here is that the province/state short codes (for a subset of countries)
                uses the ISO 3316 numeric format, which is not as helpful as just being able
                to submit the full name of the region. What we'd like to do is PUT /account
                with the full name of the province/state, but there is a server-side
                24-character limitation which makes it impossible to submit some provinces.

                Follow DBA-1066 for more information.
              */}
          {/* <EnhancedSelect
                  label="State / Province"
                  errorText={errorMap.state}
                  onChange={this.updateState}
                  placeholder="Select a State"
                  options={regionResults}
                  isClearable={false}
                  // Explicitly setting the value as an object so the text will populate on selection.
                  // For more info see here: https://github.com/JedWatson/react-select/issues/2674
                  value={
                    fields.state
                      ? {
                          label: fields.state,
                          value: fields.state
                        }
                      : ''
                  }
                  textFieldProps={{
                    dataAttrs: {
                      'data-qa-contact-province': true
                    }
                  }}
                /> */}
          <TextField
            label="State / Province"
            placeholder="Enter a State or Province"
            errorText={errorMap.state}
            onChange={(e) =>
              this.updateState({
                label: e.target.value,
                value: e.target.value,
              })
            }
            dataAttrs={{
              'data-qa-contact-province': true,
            }}
            value={fields.state || ''}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Zip / Postal Code"
            value={defaultTo(account.zip, fields.zip)}
            errorText={errorMap.zip}
            onChange={this.updateZip}
            data-qa-contact-post-code
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[
            account.country,
            fields.country,
            errorMap.country,
            classes,
          ]}
        >
          <EnhancedSelect
            label="Country"
            errorText={errorMap.country}
            onChange={this.updateCountry}
            placeholder="Select a Country"
            options={countryResults}
            isClearable={false}
            value={countryResults.find(({ value }) =>
              fields.country
                ? value === fields.country
                : value === account.country
            )}
            textFieldProps={{
              dataAttrs: {
                'data-qa-contact-country': true,
              },
            }}
          />
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[account.email, fields.email, errorMap.email, classes]}
        >
          <TextField
            inputRef={this.emailRef}
            label="Email"
            required
            type="email"
            value={defaultTo(account.email, fields.email)}
            errorText={errorMap.email}
            helperText="All e-mails from Linode will be sent to this address."
            helperTextPosition="top"
            onChange={this.updateEmail}
            data-qa-contact-email
          />
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[account.phone, fields.phone, errorMap.phone, classes]}
        >
          <TextField
            label="Phone"
            type="tel"
            value={defaultTo(account.phone, fields.phone)}
            errorText={errorMap.phone}
            onChange={this.updatePhone}
            data-qa-contact-phone
          />
        </Grid>

        <Grid
          item
          xs={12}
          updateFor={[account.tax_id, fields.tax_id, errorMap.tax_id, classes]}
        >
          <TextField
            label="Tax ID"
            value={defaultTo(account.tax_id, fields.tax_id)}
            errorText={errorMap.tax_id}
            onChange={this.updateTaxID}
            data-qa-contact-tax-id
          />
        </Grid>
      </Grid>
    );
  };

  renderFormActions = () => {
    const { classes } = this.props;

    return (
      <ActionsPanel className={classes.actions}>
        <Button
          buttonType="secondary"
          onClick={this.props.onClose}
          data-qa-reset-contact-info
        >
          Cancel
        </Button>
        <Button
          buttonType="primary"
          onClick={this.submitForm}
          loading={this.state.submitting}
          data-qa-save-contact-info
        >
          Save Changes
        </Button>
      </ActionsPanel>
    );
  };

  renderEmpty = () => null;

  updateAddress1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.address_1, e.target.value)]);
  };

  updateAddress2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.address_2, e.target.value)]);
  };

  updateCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.city, e.target.value)]);
  };

  updateCompany = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.company, e.target.value)]);
  };

  updateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.email, e.target.value)]);
  };

  updateFirstName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.first_name, e.target.value)]);
  };

  updateLastName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.last_name, e.target.value)]);
  };

  updatePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.phone, e.target.value)]);
  };

  updateState = (selectedRegion: Item) => {
    this.composeState([set(L.fields.state, selectedRegion.value)]);
  };

  updateCountry = (selectedCountry: Item) => {
    this.setState({
      fields: {
        ...this.state.fields,
        state: undefined,
      },
    });
    this.composeState([set(L.fields.country, selectedCountry.value)]);
  };

  updateTaxID = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.tax_id, e.target.value)]);
  };

  updateZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([set(L.fields.zip, e.target.value)]);
  };

  submitForm = () => {
    this.setState({
      success: undefined,
      submitting: true,
    });

    queryClient.executeMutation({
      variables: this.state.fields,
      mutationFn: updateAccountInfo,
      mutationKey: 'account',
      onSuccess: (data) => {
        // If there's a "billing_email_bounce" notification on the account, and
        // the user has just updated their email, re-request notifications to
        // potentially clear the email bounce notification.
        const hasBillingEmailBounceNotification = this.props.notifications.find(
          (thisNotification) => thisNotification.type === 'billing_email_bounce'
        );
        if (this.state.fields.email && hasBillingEmailBounceNotification) {
          this.props.requestNotifications();
        }

        // If we refactor this component to a functional component,
        // this is something we would look into cleaning up
        queryClient.setQueryData('account', (oldData: Account) => ({
          ...oldData,
          ...data,
        }));

        this.setState({
          success: 'Account information updated.',
          submitting: false,
          errResponse: undefined,
        });
        this.props.onClose();
      },
      onError: (error: APIError[]) => {
        this.setState({
          submitting: false,
          success: undefined,
          errResponse: error,
        });
        scrollErrorIntoView();
      },
    });
  };
}

const styled = withStyles(styles);

const enhanced = compose<CombinedProps, Props>(styled, withNotifications());

export default enhanced(UpdateContactInformationForm);
