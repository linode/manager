import * as React from 'react';
import TextField from 'src/components/TextField';

interface Props {
  error?: string;
  value: string;
  onChange: (ips: string[]) => void;
}

export const DomainTransferInput: React.FC<Props> = props => {
  const { error, onChange, value } = props;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    /**
     * This is a textarea input type, and users
     * are expected to input a comma-separated list of IPs.
     * However, the API is expecting an array
     * of strings. If the user clears the input, set axfr_ips to [].
     * Otherwise, split the list into an array.
     *
     * We're relying on the API to validate these, bc there's no easy
     * way to validate both v4 and v6 without bringing in a library.
     * Badly-formed input will error on their end.
     */
    const transferIPs = e.target.value === '' ? [] : e.target.value.split(',');
    onChange(transferIPs);
  };

  return (
    <TextField
      multiline
      label="Domain Transfers"
      placeholder="192.0.2.0,192.0.2.1"
      errorText={error}
      // Include some warnings and info from the API docs.
      helperText={`Comma-separated list IPs that may perform a zone transfer for this Domain.
        This is potentially dangerous, and should be left empty unless you intend to use it.`}
      rows="3"
      value={value}
      onChange={handleChange}
    />
  );
};

export default React.memo(DomainTransferInput);
