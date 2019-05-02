import { compose, defaultTo, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import EnhancedSelect, { Item } from 'src/components/EnhancedSelect/Select';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { withAccount } from 'src/features/Billing/context';
import { Requestable } from 'src/requestableContext';
import { updateAccountInfo } from 'src/services/account';
import composeState from 'src/utilities/composeState';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

import CountryData, { Region } from './countryRegionData';

type ClassNames = 'root' | 'mainFormContainer' | 'stateZip';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {},
  mainFormContainer: {
    maxWidth: 860
  },
  stateZip: {
    [theme.breakpoints.up('md')]: {
      maxWidth: `calc(415px + ${theme.spacing.unit * 2}px)`
    }
  }
});

interface State {
  submitting: boolean;
  submissionErrors?: Linode.ApiFieldError[];
  success?: string;
  fields: {
    address_1?: string;
    address_2?: string;
    city?: string;
    company?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    tax_id?: string;
    zip?: string;
    state?: string;
    country?: string;
  };
}

type CombinedProps = Requestable<Linode.Account> & WithStyles<ClassNames>;

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
    state: field(['state'])
  }
};

class UpdateContactInformationPanel extends React.Component<
  CombinedProps,
  State
> {
  state: State = {
    submitting: false,
    fields: {}
  };

  composeState = composeState;

  render() {
    return (
      <ExpansionPanel
        heading="Update Contact Information"
        actions={this.renderFormActions}
      >
        {this.renderContent()}
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const { loading, errors, data, lastUpdated } = this.props;

    if (loading && lastUpdated === 0) {
      return this.renderLoading();
    }

    if (errors) {
      return this.renderErrors(errors);
    }

    return data ? this.renderForm(data) : this.renderEmpty();
  };

  renderLoading = () => null;

  renderErrors = (e: Linode.ApiFieldError[]) => null;

  renderForm = (account: Linode.Account) => {
    const { classes } = this.props;
    const { fields, submissionErrors, success } = this.state;

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
        'zip'
      ],
      submissionErrors
    );

    const generalError = errorMap.none;

    const countryResults = CountryData.map(country => {
      return {
        value: country.countryShortCode,
        label: country.countryName
      };
    });

    const currentCountryResult = CountryData.filter(country =>
      fields.country
        ? country.countryShortCode === fields.country
        : country.countryShortCode === account.country
    );

    const countryRegions: Region[] = pathOr(
      [],
      ['0', 'regions'],
      currentCountryResult
    );

    const regionResults = countryRegions.map(region => {
      return {
        value: region.shortCode ? region.shortCode : region.name,
        label: region.name
      };
    });

    const regionSelection = regionResults.find(region => {
      return fields.state
        ? region.value === fields.state
        : region.value === account.state;
    });

    const hasChangedCountry =
      fields.country && fields.country !== account.country;

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
          updateFor={[fields.company, errorMap.company, classes]}
        >
          <Grid container>
            <Grid item xs={12} sm={6}>
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
          sm={6}
          updateFor={[fields.email, errorMap.email, classes]}
        >
          <TextField
            label="Email"
            type="email"
            value={defaultTo(account.email, fields.email)}
            errorText={errorMap.email}
            onChange={this.updateEmail}
            data-qa-contact-email
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[fields.phone, errorMap.phone, classes]}
        >
          <TextField
            label="Phone Number"
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
          sm={6}
          updateFor={[fields.first_name, errorMap.first_name, classes]}
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
          updateFor={[fields.last_name, errorMap.last_name, classes]}
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
          sm={6}
          updateFor={[fields.address_1, errorMap.address_1, classes]}
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
          sm={6}
          updateFor={[fields.address_2, errorMap.address2, classes]}
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
          updateFor={[fields.city, errorMap.city, classes]}
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
            classes
          ]}
        >
          <Grid container className={classes.stateZip}>
            <Grid item xs={12} sm={7}>
              <EnhancedSelect
                label="State / Province"
                errorText={errorMap.state}
                onChange={this.updateState}
                data-qa-contact-province
                placeholder="Select a State"
                options={regionResults}
                isClearable={false}
                value={
                  regionSelection
                    ? regionSelection
                    : hasChangedCountry
                    ? null
                    : { value: account.state, label: account.state }
                }
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Zip / Postal Code"
                value={defaultTo(account.zip, fields.zip)}
                errorText={errorMap.zip}
                onChange={this.updateZip}
                data-qa-contact-post-code
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[fields.country, errorMap.country, classes]}
        >
          <EnhancedSelect
            label="Country"
            errorText={errorMap.country}
            onChange={this.updateCountry}
            data-qa-contact-country
            placeholder="Select a Country"
            options={countryResults}
            isClearable={false}
            value={countryResults.find(({ value }) =>
              fields.country
                ? value === fields.country
                : value === account.country
            )}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          updateFor={[fields.tax_id, errorMap.tax_id, classes]}
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
    const { loading, lastUpdated, errors } = this.props;

    if ((loading && lastUpdated === 0) || errors) {
      return null;
    }

    return (
      <ActionsPanel>
        <Button
          type="primary"
          onClick={this.submitForm}
          loading={this.state.submitting}
          data-qa-save-contact-info
        >
          Save
        </Button>
        <Button
          type="secondary"
          onClick={this.resetForm}
          data-qa-reset-contact-info
        >
          Reset
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
      submissionErrors: undefined,
      success: undefined,
      submitting: true
    });

    updateAccountInfo(this.state.fields)
      .then(updatedAccount => {
        this.props.update(existingAccount => {
          /* API returns:
           * credit_card: {"expiry": null, "last_four": null}
           * rather than credit_card = null. The merge will therefore
           * overwrite the previous values for expiration/last 4 digits
           * with null, so we need to manually set them here.
           */
          return {
            ...existingAccount,
            ...updatedAccount,
            credit_card: existingAccount.credit_card
          };
        });

        this.setState({
          success: 'Contact information successfully updated.',
          submitting: false
        });
      })
      .catch(response => {
        this.setState(
          {
            submitting: false,
            submissionErrors: getAPIErrorOrDefault(
              response,
              'Unable to save your contact information. Please try again.'
            )
          },
          () => {
            scrollErrorIntoView();
          }
        );
      });
  };

  resetForm = () =>
    this.setState({
      fields: {},
      submissionErrors: undefined,
      submitting: false,
      success: undefined
    });
}

const styled = withStyles(styles);

const accountContext = withAccount();

const enhanced = compose(
  styled,
  accountContext
);

export default enhanced(
  UpdateContactInformationPanel
) as React.ComponentType<{}>;
