import * as React from 'react';
// import { APIError } from '@linode/api-v4/lib/types';
import TextField from 'src/components/TextField';
// import { getErrorMap } from 'src/utilities/errorUtils';

const SupportTicketSMTPRestrictionsForm: React.FC = () => {
  // const [errors, setErrors] = React.useState<APIError[] | undefined>();
  // const hasErrorFor = getErrorMap(['input'], errors);
  // const inputError = hasErrorFor.input;

  //  const [customerName, setCustomerName] = React.useState<string>(
  //   // Could prepopulate this from a user's account/profile info...
  // );

  return (
    <React.Fragment>
      <TextField
        label="First and last name"
        required
        // value={customerName}
        // onChange={handleInputChange}
        // inputProps={{ maxLength: 64 }}
        // errorText={inputError}
        // data-qa-ticket-customer-name
      />
      <TextField
        label="Business or company name"
        // value={companyName}
        // onChange={handleInputChange}
        // inputProps={{ maxLength: 64 }}
        // errorText={inputError}
        data-qa-ticket-company-name
      />
      <TextField
        label="A clear and detailed description of your email use case, including how you'll avoid sending unwanted emails"
        required
        expand
        multiline
        // value={useCase}
        // onChange={handleInputChange}
        // errorText={inputError}
        data-qa-ticket-use-case
      />
      <TextField
        label="Domain(s) that will be sending emails"
        required
        expand
        multiline
        // value={domains}
        // onChange={handleInputChange}
        // errorText={inputError}
        data-qa-ticket-domains
      />
      <TextField
        label="Links to public information - e.g. your business or application's website, Twitter profile, GitHub, etc."
        required
        expand
        multiline
        // value={publicInfo}
        // onChange={handleInputChange}
        // errorText={inputError}
        data-qa-ticket-public-info
      />
    </React.Fragment>
  );
};

export default SupportTicketSMTPRestrictionsForm;
