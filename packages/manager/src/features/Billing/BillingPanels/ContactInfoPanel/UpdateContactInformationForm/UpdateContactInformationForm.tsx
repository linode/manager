import { Account, updateAccountInfo } from '@linode/api-v4/lib/account';
import { APIError } from '@linode/api-v4/lib/types';
import countryData, { Region } from 'country-region-data';
import { defaultTo, lensPath, pathOr, pick, set } from 'ramda';
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
import withFeatureFlags, {
  FeatureFlagConsumerProps,
} from 'src/containers/withFeatureFlagConsumer.container';
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
      '& .MuiGrid-item:not(:first-child) label': {
        marginTop: 0,
      },
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      paddingBottom: 0,
      '& button': {
        marginBottom: 0,
      },
    },
  });

interface Props {
  onClose: () => void;
  open: boolean;
  focusEmail: boolean;
}

interface State {
  isValid: boolean;
  submitting: boolean;
  success?: string;
  fields: Partial<Account>;
  errResponse: APIError[] | undefined;
}

type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithNotifications &
  FeatureFlagConsumerProps;

const field = (path: string[]) => lensPath(['fields', ...path]);

const L = {
  fields: {
    email: field(['email']),
    first_name: field(['first_name']),
    last_name: field(['last_name']),
    company: field(['company']),
    address_1: field(['address_1']),
    address_2: field(['address_2']),
    country: field(['country']),
    state: field(['state']),
    city: field(['city']),
    zip: field(['zip']),
    phone: field(['phone']),
    tax_id: field(['tax_id']),
  },
};

const excludedUSRegions = ['Micronesia', 'Marshall Islands', 'Palau'];

class UpdateContactInformationForm extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    isValid: true,
    submitting: false,
    fields: {},
    errResponse: undefined,
  };

  composeState = composeState;

  emailRef = React.createRef<HTMLInputElement>();

  async componentDidMount() {
    const account = queryClient.getQueryData<Account>('account');

    // 'account' has all data returned form the /v4/account endpoint.
    // We need to pick only editable fields and fields we want to
    // display in the form.
    const editableContactInformationFields = pick(
      [
        'email',
        'first_name',
        'last_name',
        'company',
        'address_1',
        'address_2',
        'country',
        'state',
        'city',
        'zip',
        'phone',
        'tax_id',
      ],
      account
    );

    if (account) {
      this.setState({ fields: editableContactInformationFields });
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
    const { classes, flags } = this.props;
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

    const currentCountryResult = countryData.filter((country: Country) =>
      fields.country
        ? country.countryShortCode === fields.country
        : country.countryShortCode === account.country
    );

    const countryRegions: Region[] = pathOr(
      [],
      ['0', 'regions'],
      currentCountryResult
    );

    const regionResults = countryRegions.map((region) => {
      if (fields.country === 'US' && region.name === 'Virgin Islands') {
        return {
          value: region.shortCode,
          label: 'Virgin Islands, U.S.',
        };
      }

      return {
        value: region.shortCode,
        label: region.name,
      };
    });

    let filteredRegionResults;

    if (fields.country === 'US') {
      filteredRegionResults = regionResults.filter(
        (region) => !excludedUSRegions.includes(region.label)
      );

      filteredRegionResults.push({
        value: 'UM',
        label: 'United States Minor Outlying Islands',
      });
    } else {
      filteredRegionResults = regionResults;
    }

    // Prevent edge case field error for "Company Name" when updating billing info
    // for accounts that did not initially require an address.
    if (this.state.fields.company === null) {
      this.setState({
        fields: { ...this.state.fields, company: '' },
      });
    }

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
          updateFor={[account.email, fields.email, errorMap.email, classes]}
        >
          <TextField
            label="Email"
            errorText={errorMap.email}
            helperTextPosition="top"
            inputRef={this.emailRef}
            onChange={this.updateEmail}
            required
            type="email"
            value={defaultTo(account.email, fields.email)}
            data-qa-contact-email
          />
        </Grid>

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
            errorText={errorMap.first_name}
            onChange={this.updateFirstName}
            value={defaultTo(account.first_name, fields.first_name)}
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
            errorText={errorMap.last_name}
            onChange={this.updateLastName}
            value={defaultTo(account.last_name, fields.last_name)}
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
          <Grid item xs={12}>
            <TextField
              label="Company Name"
              errorText={errorMap.company}
              onChange={this.updateCompany}
              value={defaultTo(account.company, fields.company)}
              data-qa-company
            />
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
            errorText={errorMap.address_1}
            onChange={this.updateAddress1}
            value={defaultTo(account.address_1, fields.address_1)}
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
            errorText={errorMap.address_2}
            onChange={this.updateAddress2}
            value={defaultTo(account.address_2, fields.address_2)}
            data-qa-contact-address-2
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
            isClearable={false}
            onChange={this.updateCountry}
            options={countryResults}
            placeholder="Select a Country"
            required={flags.regionDropdown}
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
          {flags.regionDropdown &&
          (fields.country === 'US' || fields.country == 'CA') ? (
            <EnhancedSelect
              label={`${fields.country === 'US' ? 'State' : 'Province'}`}
              errorText={errorMap.state}
              isClearable={false}
              onChange={this.updateState}
              options={filteredRegionResults}
              placeholder={
                account.state ||
                `Select ${fields.country === 'US' ? 'state' : 'province'}`
              }
              required={flags.regionDropdown}
              value={
                filteredRegionResults.find(({ value }) =>
                  fields.state
                    ? value === fields.state
                    : value === account.state
                ) ?? ''
              }
              textFieldProps={{
                'data-qa-contact-state-province': true,
              }}
            />
          ) : (
            <TextField
              label="State / Province"
              errorText={errorMap.state}
              onChange={(e) =>
                this.updateState({
                  label: e.target.value,
                  value: e.target.value,
                })
              }
              placeholder="Enter region"
              required={flags.regionDropdown}
              value={fields.state || ''}
              data-qa-contact-state-province
            />
          )}
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[account.city, fields.city, errorMap.city, classes]}
        >
          <TextField
            label="City"
            errorText={errorMap.city}
            onChange={this.updateCity}
            value={defaultTo(account.city, fields.city)}
            data-qa-contact-city
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Postal Code"
            errorText={errorMap.zip}
            onChange={this.updateZip}
            value={defaultTo(account.zip, fields.zip)}
            data-qa-contact-post-code
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
            errorText={errorMap.phone}
            onChange={this.updatePhone}
            value={defaultTo(account.phone, fields.phone)}
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
            errorText={errorMap.tax_id}
            onChange={this.updateTaxID}
            value={defaultTo(account.tax_id, fields.tax_id)}
            data-qa-contact-tax-id
          />
        </Grid>
      </Grid>
    );
  };

  renderFormActions = () => {
    const { classes, flags } = this.props;

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
          disabled={flags.regionDropdown && !this.state.isValid}
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
    const { flags } = this.props;
    if (flags.regionDropdown && e.target.value === '') {
      this.setState({ isValid: false });
    } else {
      this.setState({ isValid: true });
    }
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
    const { flags } = this.props;
    if (
      flags.regionDropdown &&
      (selectedRegion.value === undefined || selectedRegion.value === '')
    ) {
      this.setState({ isValid: false });
    } else {
      this.setState({ isValid: true });
    }
    this.composeState([set(L.fields.state, selectedRegion.value)]);
  };

  updateCountry = (selectedCountry: Item) => {
    const { flags } = this.props;

    this.setState({
      fields: {
        ...this.state.fields,
        state: undefined,
      },
    });

    if (flags.regionDropdown) {
      this.setState({
        isValid: false,
      });
    }
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

const enhanced = compose<CombinedProps, Props>(
  styled,
  withFeatureFlags,
  withNotifications()
);

export default enhanced(UpdateContactInformationForm);
