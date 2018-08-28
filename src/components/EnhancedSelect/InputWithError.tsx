import * as React from 'react';
import Input, { InputProps } from 'react-select/lib/components/Input';

interface Props {
  errorText: string;
}

type CombinedProps = Props & InputProps;

export const inputWithError: React.StatelessComponent<CombinedProps> = (props) => {
  const { errorText } = props;
  return (
    <React.Fragment>
      <Input {...props} />
      <div>{errorText}</div>
    </React.Fragment>
  )
}

export default inputWithError;