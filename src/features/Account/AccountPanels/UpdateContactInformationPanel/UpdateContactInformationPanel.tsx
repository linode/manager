import { compose, defaultTo, lensPath, pathOr, set } from 'ramda';
import * as React from 'react';

import { StyleRulesCallback, withStyles, WithStyles } from '@material-ui/core/styles';

import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import ExpansionPanel from 'src/components/ExpansionPanel';
import Grid from 'src/components/Grid';
import MenuItem from 'src/components/MenuItem';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';
import { withAccount } from 'src/features/Account/context';
import { Requestable } from 'src/requestableContext';
import { updateAccountInfo } from 'src/services/account';
import composeState from 'src/utilities/composeState';
import getAPIErrorFor from 'src/utilities/getAPIErrorFor';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';

type ClassNames = 'root'
  | 'mainFormContainer'
  | 'stateZip';

const styles: StyleRulesCallback<ClassNames> = (theme) => ({
  root: {},
  mainFormContainer: {
    maxWidth: 860,
  },
  stateZip: {
    [theme.breakpoints.up('md')]: {
      maxWidth: `calc(415px + ${theme.spacing.unit * 2}px)`,
    },
  },
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
    country?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    state?: string;
    tax_id?: string;
    zip?: string;
  },
}

type CombinedProps = Requestable<Linode.Account>
  & WithStyles<ClassNames>;

const field = (path: string[]) => lensPath(['fields', ...path]);

const L = {
  fields: {
    address_1: field(['address_1']),
    address_2: field(['address_2']),
    city: field(['city']),
    company: field(['company']),
    country: field(['country']),
    email: field(['email']),
    first_name: field(['first_name']),
    last_name: field(['last_name']),
    phone: field(['phone']),
    state: field(['state']),
    tax_id: field(['tax_id']),
    zip: field(['zip']),
  },
};

class UpdateContactInformationPanel extends React.Component<CombinedProps, State> {
  state: State = {
    submitting: false,
    fields: {},
  };

  composeState = composeState;

  render() {
    return (
      <ExpansionPanel heading="Update Contact Information" actions={this.renderFormActions}>
        {this.renderContent()}
      </ExpansionPanel>
    );
  }

  renderContent = () => {
    const {
      loading, errors, data, lastUpdated,
    } = this.props;

    if (loading && lastUpdated === 0) {
      return this.renderLoading();
    };

    if (errors) {
      return this.renderErrors(errors);
    }

    return data ? this.renderForm(data) : this.renderEmpty();
  }

  renderLoading = () => null;

  renderErrors = (e: Linode.ApiFieldError[]) => null;

  renderForm = (account: Linode.Account) => {
    const { classes } = this.props;
    const { fields, submissionErrors, success } = this.state;

    const hasErrorFor = getAPIErrorFor({
      address_1: 'address',
      address_2: 'address 2',
      city: 'city',
      company: 'company',
      country: 'country',
      email: 'email',
      first_name: 'first name',
      last_name: 'last name',
      phone: 'phone',
      state: 'state / province',
      tax_id: 'tax ID',
      zip: 'zip / postal code',
    }, submissionErrors)

    const generalError = hasErrorFor('none');

    return (
      <Grid container className={classes.mainFormContainer}>
        {generalError && <Grid item xs={12}><Notice error text={generalError} /></Grid>}
        {success && <Grid item xs={12}><Notice success text={success} /></Grid>}

        <Grid item xs={12}>
          <Grid container>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company Name"
                value={defaultTo(account.company, fields.company)}
                errorText={hasErrorFor('company')}
                onChange={this.updateCompany}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Email"
            type="email"
            value={defaultTo(account.email, fields.email)}
            errorText={hasErrorFor('email')}
            onChange={this.updateEmail}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Phone Number"
            type="tel"
            value={defaultTo(account.phone, fields.phone)}
            errorText={hasErrorFor('phone')}
            onChange={this.updatePhone}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            value={defaultTo(account.first_name, fields.first_name)}
            errorText={hasErrorFor('first_name')}
            onChange={this.updateFirstName}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            value={defaultTo(account.last_name, fields.last_name)}
            errorText={hasErrorFor('last_name')}
            onChange={this.updateLastName}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Address"
            value={defaultTo(account.address_1, fields.address_1)}
            errorText={hasErrorFor('address_1')}
            onChange={this.updateAddress1}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Address 2"
            value={defaultTo(account.address_2, fields.address_2)}
            errorText={hasErrorFor('address_2')}
            onChange={this.updateAddress2}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="City"
            value={defaultTo(account.city, fields.city)}
            errorText={hasErrorFor('city')}
            onChange={this.updateCity}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Grid container className={classes.stateZip}>
            <Grid item xs={12} sm={7}>
              <TextField
                label="State / Province"
                value={defaultTo(account.state, fields.state)}
                errorText={hasErrorFor('state')}
                onChange={this.updateState}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                label="Zip / Postal Code"
                value={defaultTo(account.zip, fields.zip)}
                errorText={hasErrorFor('zip')}
                onChange={this.updateZip}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Country"
            value={defaultTo(account.country, fields.country)}
            errorText={hasErrorFor('country')}
            onChange={this.updateCountry}
            select
          >
            {UpdateContactInformationPanel.countryItems()}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Tax ID"
            value={defaultTo(account.tax_id, fields.tax_id)}
            errorText={hasErrorFor('tax_id')}
            onChange={this.updateTaxID}
          />
        </Grid>

      </Grid>
    );
  };

  static countryItems = () => ([
    <MenuItem value="AF" key="AF">Afghanistan</MenuItem>,
    <MenuItem value="AX" key="AX">Åland Islands</MenuItem>,
    <MenuItem value="AL" key="AL">Albania</MenuItem>,
    <MenuItem value="DZ" key="DZ">Algeria</MenuItem>,
    <MenuItem value="AS" key="AS">American Samoa</MenuItem>,
    <MenuItem value="AD" key="AD">Andorra</MenuItem>,
    <MenuItem value="AO" key="AO">Angola</MenuItem>,
    <MenuItem value="AI" key="AI">Anguilla</MenuItem>,
    <MenuItem value="AQ" key="AQ">Antarctica</MenuItem>,
    <MenuItem value="AG" key="AG">Antigua and Barbuda</MenuItem>,
    <MenuItem value="AR" key="AR">Argentina</MenuItem>,
    <MenuItem value="AM" key="AM">Armenia</MenuItem>,
    <MenuItem value="AW" key="AW">Aruba</MenuItem>,
    <MenuItem value="AU" key="AU">Australia</MenuItem>,
    <MenuItem value="AT" key="AT">Austria</MenuItem>,
    <MenuItem value="AZ" key="AZ">Azerbaijan</MenuItem>,
    <MenuItem value="BS" key="BS">Bahamas</MenuItem>,
    <MenuItem value="BH" key="BH">Bahrain</MenuItem>,
    <MenuItem value="BD" key="BD">Bangladesh</MenuItem>,
    <MenuItem value="BB" key="BB">Barbados</MenuItem>,
    <MenuItem value="BY" key="BY">Belarus</MenuItem>,
    <MenuItem value="BE" key="BE">Belgium</MenuItem>,
    <MenuItem value="BZ" key="BZ">Belize</MenuItem>,
    <MenuItem value="BJ" key="BJ">Benin</MenuItem>,
    <MenuItem value="BM" key="BM">Bermuda</MenuItem>,
    <MenuItem value="BT" key="BT">Bhutan</MenuItem>,
    <MenuItem value="BO" key="BO">Bolivia (Plurinational State of)</MenuItem>,
    <MenuItem value="BQ" key="BQ">Bonaire, Sint Eustatius and Saba</MenuItem>,
    <MenuItem value="BA" key="BA">Bosnia and Herzegovina</MenuItem>,
    <MenuItem value="BW" key="BW">Botswana</MenuItem>,
    <MenuItem value="BV" key="BV">Bouvet Island</MenuItem>,
    <MenuItem value="BR" key="BR">Brazil</MenuItem>,
    <MenuItem value="IO" key="IO">British Indian Ocean Territory</MenuItem>,
    <MenuItem value="BN" key="BN">Brunei Darussalam</MenuItem>,
    <MenuItem value="BG" key="BG">Bulgaria</MenuItem>,
    <MenuItem value="BF" key="BF">Burkina Faso</MenuItem>,
    <MenuItem value="BI" key="BI">Burundi</MenuItem>,
    <MenuItem value="CV" key="CV">Cabo Verde</MenuItem>,
    <MenuItem value="KH" key="KH">Cambodia</MenuItem>,
    <MenuItem value="CM" key="CM">Cameroon</MenuItem>,
    <MenuItem value="CA" key="CA">Canada</MenuItem>,
    <MenuItem value="KY" key="KY">Cayman Islands</MenuItem>,
    <MenuItem value="CF" key="CF">Central African Republic</MenuItem>,
    <MenuItem value="TD" key="TD">Chad</MenuItem>,
    <MenuItem value="CL" key="CL">Chile</MenuItem>,
    <MenuItem value="CN" key="CN">China</MenuItem>,
    <MenuItem value="CX" key="CX">Christmas Island</MenuItem>,
    <MenuItem value="CC" key="CC">Cocos (Keeling) Islands</MenuItem>,
    <MenuItem value="CO" key="CO">Colombia</MenuItem>,
    <MenuItem value="KM" key="KM">Comoros</MenuItem>,
    <MenuItem value="CG" key="CG">Congo</MenuItem>,
    <MenuItem value="CD" key="CD">Congo (Democratic Republic of the)</MenuItem>,
    <MenuItem value="CK" key="CK">Cook Islands</MenuItem>,
    <MenuItem value="CR" key="CR">Costa Rica</MenuItem>,
    <MenuItem value="CI" key="CI">Côte d'Ivoire</MenuItem>,
    <MenuItem value="HR" key="HR">Croatia</MenuItem>,
    <MenuItem value="CU" key="CU">Cuba</MenuItem>,
    <MenuItem value="CW" key="CW">Curaçao</MenuItem>,
    <MenuItem value="CY" key="CY">Cyprus</MenuItem>,
    <MenuItem value="CZ" key="CZ">Czechia</MenuItem>,
    <MenuItem value="DK" key="DK">Denmark</MenuItem>,
    <MenuItem value="DJ" key="DJ">Djibouti</MenuItem>,
    <MenuItem value="DM" key="DM">Dominica</MenuItem>,
    <MenuItem value="DO" key="DO">Dominican Republic</MenuItem>,
    <MenuItem value="EC" key="EC">Ecuador</MenuItem>,
    <MenuItem value="EG" key="EG">Egypt</MenuItem>,
    <MenuItem value="SV" key="SV">El Salvador</MenuItem>,
    <MenuItem value="GQ" key="GQ">Equatorial Guinea</MenuItem>,
    <MenuItem value="ER" key="ER">Eritrea</MenuItem>,
    <MenuItem value="EE" key="EE">Estonia</MenuItem>,
    <MenuItem value="ET" key="ET">Ethiopia</MenuItem>,
    <MenuItem value="FK" key="FK">Falkland Islands (Malvinas)</MenuItem>,
    <MenuItem value="FO" key="FO">Faroe Islands</MenuItem>,
    <MenuItem value="FJ" key="FJ">Fiji</MenuItem>,
    <MenuItem value="FI" key="FI">Finland</MenuItem>,
    <MenuItem value="FR" key="FR">France</MenuItem>,
    <MenuItem value="GF" key="GF">French Guiana</MenuItem>,
    <MenuItem value="PF" key="PF">French Polynesia</MenuItem>,
    <MenuItem value="TF" key="TF">French Southern Territories</MenuItem>,
    <MenuItem value="GA" key="GA">Gabon</MenuItem>,
    <MenuItem value="GM" key="GM">Gambia</MenuItem>,
    <MenuItem value="GE" key="GE">Georgia</MenuItem>,
    <MenuItem value="DE" key="DE">Germany</MenuItem>,
    <MenuItem value="GH" key="GH">Ghana</MenuItem>,
    <MenuItem value="GI" key="GI">Gibraltar</MenuItem>,
    <MenuItem value="GR" key="GR">Greece</MenuItem>,
    <MenuItem value="GL" key="GL">Greenland</MenuItem>,
    <MenuItem value="GD" key="GD">Grenada</MenuItem>,
    <MenuItem value="GP" key="GP">Guadeloupe</MenuItem>,
    <MenuItem value="GU" key="GU">Guam</MenuItem>,
    <MenuItem value="GT" key="GT">Guatemala</MenuItem>,
    <MenuItem value="GG" key="GG">Guernsey</MenuItem>,
    <MenuItem value="GN" key="GN">Guinea</MenuItem>,
    <MenuItem value="GW" key="GW">Guinea-Bissau</MenuItem>,
    <MenuItem value="GY" key="GY">Guyana</MenuItem>,
    <MenuItem value="HT" key="HT">Haiti</MenuItem>,
    <MenuItem value="HM" key="HM">Heard Island and McDonald Islands</MenuItem>,
    <MenuItem value="VA" key="VA">Holy See</MenuItem>,
    <MenuItem value="HN" key="HN">Honduras</MenuItem>,
    <MenuItem value="HK" key="HK">Hong Kong</MenuItem>,
    <MenuItem value="HU" key="HU">Hungary</MenuItem>,
    <MenuItem value="IS" key="IS">Iceland</MenuItem>,
    <MenuItem value="IN" key="IN">India</MenuItem>,
    <MenuItem value="ID" key="ID">Indonesia</MenuItem>,
    <MenuItem value="IR" key="IR">Iran (Islamic Republic of)</MenuItem>,
    <MenuItem value="IQ" key="IQ">Iraq</MenuItem>,
    <MenuItem value="IE" key="IE">Ireland</MenuItem>,
    <MenuItem value="IM" key="IM">Isle of Man</MenuItem>,
    <MenuItem value="IL" key="IL">Israel</MenuItem>,
    <MenuItem value="IT" key="IT">Italy</MenuItem>,
    <MenuItem value="JM" key="JM">Jamaica</MenuItem>,
    <MenuItem value="JP" key="JP">Japan</MenuItem>,
    <MenuItem value="JE" key="JE">Jersey</MenuItem>,
    <MenuItem value="JO" key="JO">Jordan</MenuItem>,
    <MenuItem value="KZ" key="KZ">Kazakhstan</MenuItem>,
    <MenuItem value="KE" key="KE">Kenya</MenuItem>,
    <MenuItem value="KI" key="KI">Kiribati</MenuItem>,
    <MenuItem value="KP" key="KP">Korea (Democratic People's Republic of)</MenuItem>,
    <MenuItem value="KR" key="KR">Korea (Republic of)</MenuItem>,
    <MenuItem value="KW" key="KW">Kuwait</MenuItem>,
    <MenuItem value="KG" key="KG">Kyrgyzstan</MenuItem>,
    <MenuItem value="LA" key="LA">Lao People's Democratic Republic</MenuItem>,
    <MenuItem value="LV" key="LV">Latvia</MenuItem>,
    <MenuItem value="LB" key="LB">Lebanon</MenuItem>,
    <MenuItem value="LS" key="LS">Lesotho</MenuItem>,
    <MenuItem value="LR" key="LR">Liberia</MenuItem>,
    <MenuItem value="LY" key="LY">Libya</MenuItem>,
    <MenuItem value="LI" key="LI">Liechtenstein</MenuItem>,
    <MenuItem value="LT" key="LT">Lithuania</MenuItem>,
    <MenuItem value="LU" key="LU">Luxembourg</MenuItem>,
    <MenuItem value="MO" key="MO">Macao</MenuItem>,
    <MenuItem value="MK" key="MK">Macedonia (the former Yugoslav Republic of)</MenuItem>,
    <MenuItem value="MG" key="MG">Madagascar</MenuItem>,
    <MenuItem value="MW" key="MW">Malawi</MenuItem>,
    <MenuItem value="MY" key="MY">Malaysia</MenuItem>,
    <MenuItem value="MV" key="MV">Maldives</MenuItem>,
    <MenuItem value="ML" key="ML">Mali</MenuItem>,
    <MenuItem value="MT" key="MT">Malta</MenuItem>,
    <MenuItem value="MH" key="MH">Marshall Islands</MenuItem>,
    <MenuItem value="MQ" key="MQ">Martinique</MenuItem>,
    <MenuItem value="MR" key="MR">Mauritania</MenuItem>,
    <MenuItem value="MU" key="MU">Mauritius</MenuItem>,
    <MenuItem value="YT" key="YT">Mayotte</MenuItem>,
    <MenuItem value="MX" key="MX">Mexico</MenuItem>,
    <MenuItem value="FM" key="FM">Micronesia (Federated States of)</MenuItem>,
    <MenuItem value="MD" key="MD">Moldova (Republic of)</MenuItem>,
    <MenuItem value="MC" key="MC">Monaco</MenuItem>,
    <MenuItem value="MN" key="MN">Mongolia</MenuItem>,
    <MenuItem value="ME" key="ME">Montenegro</MenuItem>,
    <MenuItem value="MS" key="MS">Montserrat</MenuItem>,
    <MenuItem value="MA" key="MA">Morocco</MenuItem>,
    <MenuItem value="MZ" key="MZ">Mozambique</MenuItem>,
    <MenuItem value="MM" key="MM">Myanmar</MenuItem>,
    <MenuItem value="NA" key="NA">Namibia</MenuItem>,
    <MenuItem value="NR" key="NR">Nauru</MenuItem>,
    <MenuItem value="NP" key="NP">Nepal</MenuItem>,
    <MenuItem value="NL" key="NL">Netherlands</MenuItem>,
    <MenuItem value="NC" key="NC">New Caledonia</MenuItem>,
    <MenuItem value="NZ" key="NZ">New Zealand</MenuItem>,
    <MenuItem value="NI" key="NI">Nicaragua</MenuItem>,
    <MenuItem value="NE" key="NE">Niger</MenuItem>,
    <MenuItem value="NG" key="NG">Nigeria</MenuItem>,
    <MenuItem value="NU" key="NU">Niue</MenuItem>,
    <MenuItem value="NF" key="NF">Norfolk Island</MenuItem>,
    <MenuItem value="MP" key="MP">Northern Mariana Islands</MenuItem>,
    <MenuItem value="NO" key="NO">Norway</MenuItem>,
    <MenuItem value="OM" key="OM">Oman</MenuItem>,
    <MenuItem value="PK" key="PK">Pakistan</MenuItem>,
    <MenuItem value="PW" key="PW">Palau</MenuItem>,
    <MenuItem value="PS" key="PS">Palestine, State of</MenuItem>,
    <MenuItem value="PA" key="PA">Panama</MenuItem>,
    <MenuItem value="PG" key="PG">Papua New Guinea</MenuItem>,
    <MenuItem value="PY" key="PY">Paraguay</MenuItem>,
    <MenuItem value="PE" key="PE">Peru</MenuItem>,
    <MenuItem value="PH" key="PH">Philippines</MenuItem>,
    <MenuItem value="PN" key="PN">Pitcairn</MenuItem>,
    <MenuItem value="PL" key="PL">Poland</MenuItem>,
    <MenuItem value="PT" key="PT">Portugal</MenuItem>,
    <MenuItem value="PR" key="PR">Puerto Rico</MenuItem>,
    <MenuItem value="QA" key="QA">Qatar</MenuItem>,
    <MenuItem value="RE" key="RE">Réunion</MenuItem>,
    <MenuItem value="RO" key="RO">Romania</MenuItem>,
    <MenuItem value="RU" key="RU">Russian Federation</MenuItem>,
    <MenuItem value="RW" key="RW">Rwanda</MenuItem>,
    <MenuItem value="BL" key="BL">Saint Barthélemy</MenuItem>,
    <MenuItem value="SH" key="SH">Saint Helena, Ascension and Tristan da Cunha</MenuItem>,
    <MenuItem value="KN" key="KN">Saint Kitts and Nevis</MenuItem>,
    <MenuItem value="LC" key="LC">Saint Lucia</MenuItem>,
    <MenuItem value="MF" key="MF">Saint Martin (French part)</MenuItem>,
    <MenuItem value="PM" key="PM">Saint Pierre and Miquelon</MenuItem>,
    <MenuItem value="VC" key="VC">Saint Vincent and the Grenadines</MenuItem>,
    <MenuItem value="WS" key="WS">Samoa</MenuItem>,
    <MenuItem value="SM" key="SM">San Marino</MenuItem>,
    <MenuItem value="ST" key="ST">Sao Tome and Principe</MenuItem>,
    <MenuItem value="SA" key="SA">Saudi Arabia</MenuItem>,
    <MenuItem value="SN" key="SN">Senegal</MenuItem>,
    <MenuItem value="RS" key="RS">Serbia</MenuItem>,
    <MenuItem value="SC" key="SC">Seychelles</MenuItem>,
    <MenuItem value="SL" key="SL">Sierra Leone</MenuItem>,
    <MenuItem value="SG" key="SG">Singapore</MenuItem>,
    <MenuItem value="SX" key="SX">Sint Maarten (Dutch part)</MenuItem>,
    <MenuItem value="SK" key="SK">Slovakia</MenuItem>,
    <MenuItem value="SI" key="SI">Slovenia</MenuItem>,
    <MenuItem value="SB" key="SB">Solomon Islands</MenuItem>,
    <MenuItem value="SO" key="SO">Somalia</MenuItem>,
    <MenuItem value="ZA" key="ZA">South Africa</MenuItem>,
    <MenuItem value="GS" key="GS">South Georgia and the South Sandwich Islands</MenuItem>,
    <MenuItem value="SS" key="SS">South Sudan</MenuItem>,
    <MenuItem value="ES" key="ES">Spain</MenuItem>,
    <MenuItem value="LK" key="LK">Sri Lanka</MenuItem>,
    <MenuItem value="SD" key="SD">Sudan</MenuItem>,
    <MenuItem value="SR" key="SR">Suriname</MenuItem>,
    <MenuItem value="SJ" key="SJ">Svalbard and Jan Mayen</MenuItem>,
    <MenuItem value="SZ" key="SZ">Swaziland</MenuItem>,
    <MenuItem value="SE" key="SE">Sweden</MenuItem>,
    <MenuItem value="CH" key="CH">Switzerland</MenuItem>,
    <MenuItem value="SY" key="SY">Syrian Arab Republic</MenuItem>,
    <MenuItem value="TW" key="TW">Taiwan, Province of China</MenuItem>,
    <MenuItem value="TJ" key="TJ">Tajikistan</MenuItem>,
    <MenuItem value="TZ" key="TZ">Tanzania, United Republic of</MenuItem>,
    <MenuItem value="TH" key="TH">Thailand</MenuItem>,
    <MenuItem value="TL" key="TL">Timor-Leste</MenuItem>,
    <MenuItem value="TG" key="TG">Togo</MenuItem>,
    <MenuItem value="TK" key="TK">Tokelau</MenuItem>,
    <MenuItem value="TO" key="TO">Tonga</MenuItem>,
    <MenuItem value="TT" key="TT">Trinidad and Tobago</MenuItem>,
    <MenuItem value="TN" key="TN">Tunisia</MenuItem>,
    <MenuItem value="TR" key="TR">Turkey</MenuItem>,
    <MenuItem value="TM" key="TM">Turkmenistan</MenuItem>,
    <MenuItem value="TC" key="TC">Turks and Caicos Islands</MenuItem>,
    <MenuItem value="TV" key="TV">Tuvalu</MenuItem>,
    <MenuItem value="UG" key="UG">Uganda</MenuItem>,
    <MenuItem value="UA" key="UA">Ukraine</MenuItem>,
    <MenuItem value="AE" key="AE">United Arab Emirates</MenuItem>,
    <MenuItem value="GB" key="GB">United Kingdom of Great Britain and Northern Ireland</MenuItem>,
    <MenuItem value="US" key="US">United States of America</MenuItem>,
    <MenuItem value="UM" key="UM">United States Minor Outlying Islands</MenuItem>,
    <MenuItem value="UY" key="UY">Uruguay</MenuItem>,
    <MenuItem value="UZ" key="UZ">Uzbekistan</MenuItem>,
    <MenuItem value="VU" key="VU">Vanuatu</MenuItem>,
    <MenuItem value="VE" key="VE">Venezuela (Bolivarian Republic of)</MenuItem>,
    <MenuItem value="VN" key="VN">Viet Nam</MenuItem>,
    <MenuItem value="VG" key="VG">Virgin Islands (British)</MenuItem>,
    <MenuItem value="VI" key="VI">Virgin Islands (U.S.)</MenuItem>,
    <MenuItem value="WF" key="WF">Wallis and Futuna</MenuItem>,
    <MenuItem value="EH" key="EH">Western Sahara</MenuItem>,
    <MenuItem value="YE" key="YE">Yemen</MenuItem>,
    <MenuItem value="ZM" key="ZM">Zambia</MenuItem>,
    <MenuItem value="ZW" key="ZW">Zimbabwe</MenuItem>,
  ]);

  renderFormActions = () => {
    const { loading, lastUpdated, errors } = this.props;

    if ((loading && lastUpdated === 0) || errors) { return null; }

    return (
      <ActionsPanel>
        <Button type="primary" onClick={this.submitForm} loading={this.state.submitting}>Save</Button>
        <Button type="secondary" onClick={this.resetForm}>Reset</Button>
      </ActionsPanel>
    );
  };

  renderEmpty = () => null;

  updateAddress1 = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.address_1, e.target.value),
    ])
  };

  updateAddress2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.address_2, e.target.value),
    ])
  };

  updateCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.city, e.target.value),
    ])
  };

  updateCompany = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.company, e.target.value),
    ])
  };

  updateCountry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.composeState([
      set(L.fields.country, e.target.value),
    ])
  };

  updateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.email, e.target.value),
    ])
  };

  updateFirstName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.first_name, e.target.value),
    ])
  };

  updateLastName = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.last_name, e.target.value),
    ])
  };

  updatePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.phone, e.target.value),
    ])
  };

  updateState = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.state, e.target.value),
    ])
  };

  updateTaxID = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.tax_id, e.target.value),
    ])
  };

  updateZip = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.composeState([
      set(L.fields.zip, e.target.value),
    ])
  };

  submitForm = () => {
    this.setState({
      submissionErrors: undefined,
      success: undefined,
      submitting: true,
    })

    updateAccountInfo(this.state.fields)
      .then((updatedAccount) => {
        this.props.update((existingAccount) => {
          /* API returns:
          * credit_card: {"expiry": null, "last_four": null}
          * rather than credit_card = null. The merge will therefore
          * overwrite the previous values for expiration/last 4 digits
          * with null, so we need to manually set them here.
          */
          return {...existingAccount,
                  ...updatedAccount,
                  credit_card: existingAccount.credit_card
                 }
        });

        this.setState({
          success: 'Contact information successfully updated.',
          submitting: false,
        })
      })
      .catch((response) => {
        const fallbackError = [{ reason: 'Unable to save your contact information. Please try again.' }];
        this.setState({
          submitting: false,
          submissionErrors: pathOr(fallbackError, ['response', 'data', 'errors'], response),
        }, () => {
          scrollErrorIntoView();
        })
      });
  }

  resetForm = () => this.setState({
    fields: {},
    submissionErrors: undefined,
    submitting: false,
    success: undefined
  });
}

const styled = withStyles(styles, { withTheme: true });

const accountContext = withAccount();

const enhanced = compose(styled, accountContext);

export default enhanced(UpdateContactInformationPanel);
