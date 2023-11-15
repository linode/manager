import React from 'react';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';
import { useLoadBalancerCertificatesInfiniteQuery } from 'src/queries/aglb/certificates';

import type { Certificate, Filter } from '@linode/api-v4';
import { TextFieldProps } from 'src/components/TextField';

interface Props {
  /**
   * Error text to display as helper text under the TextField. Useful for validation errors.
   */
  errorText?: string;
  /**
   * An optional API filter to apply to the API request
   */
  filter?: Filter;
  /**
   * The TextField label
   * @default Certificate
   */
  label?: string;
  /**
   * The id of the Load Balancer you want to show certificates for
   */
  loadbalancerId: number;
  /**
   * Called when the value of the Select changes
   */
  onChange: (certificate: Certificate | null) => void;
  /**
   * Optional Textfield Props
   */
  textFieldProps?: Partial<TextFieldProps>;
  /**
   * The id of the selected certificate
   */
  value: null | number;
}

export const CertificateSelect = (props: Props) => {
  const {
    errorText,
    label,
    loadbalancerId,
    onChange,
    textFieldProps,
    value,
  } = props;

  const [inputValue, setInputValue] = React.useState<string>('');

  const filter: Filter = props.filter ?? {};

  if (inputValue) {
    filter['label'] = { '+contains': inputValue };
  }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useLoadBalancerCertificatesInfiniteQuery(loadbalancerId, filter);

  const certificates = data?.pages.flatMap((page) => page.data);

  const selectedCertificate =
    certificates?.find((cert) => cert.id === value) ?? null;

  const onScroll = (event: React.SyntheticEvent) => {
    const listboxNode = event.currentTarget;
    if (
      listboxNode.scrollTop + listboxNode.clientHeight >=
        listboxNode.scrollHeight &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  };

  return (
    <Autocomplete
      ListboxProps={{
        onScroll,
      }}
      onInputChange={(_, value, reason) => {
        if (reason === 'input') {
          setInputValue(value);
        }
      }}
      errorText={error?.[0].reason ?? errorText}
      inputValue={selectedCertificate ? selectedCertificate.label : inputValue}
      label={label ?? 'Certificate'}
      loading={isLoading}
      onChange={(e, value) => onChange(value)}
      options={certificates ?? []}
      placeholder="Select a Certificate"
      textFieldProps={textFieldProps}
      value={selectedCertificate}
    />
  );
};
