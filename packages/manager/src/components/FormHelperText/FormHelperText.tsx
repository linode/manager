import * as React from 'react';
import _FormHelperText, {
  FormHelperTextProps,
} from 'src/components/core/FormHelperText';

export interface Props extends FormHelperTextProps {
  children: JSX.Element;
}

const FormHelperText = (props: Props) => {
  const { children } = props;

  return <_FormHelperText>{children}</_FormHelperText>;
};

export default FormHelperText;
