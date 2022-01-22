import * as React from 'react';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

export interface Props {
  confirmationText?: JSX.Element | string;
  onChange: (str: string) => void;
  label: string;
  hideLabel?: boolean;
  textFieldStyle?: Record<string, any>;
  typographyStyle?: Record<string, any>;
  visible?: boolean | undefined;
  title?: string;
  // This is a string index signature.
  // This means that all properties in 'Props' are assignable to any
  [propName: string]: any;
}

type CombinedProps = Props;

const TypeToConfirm: React.FC<CombinedProps> = (props) => {
  const {
    confirmationText,
    onChange,
    label,
    hideLabel,
    textFieldStyle,
    typographyStyle,
    title,
    visible,
    ...rest
  } = props;
  if (visible === undefined || !!visible) {
    return (
      <div>
        <Typography variant="h2">{title}</Typography>
        <Typography style={typographyStyle}>{confirmationText}</Typography>
        <TextField
          label={label}
          hideLabel={hideLabel}
          onChange={(e) => onChange(e.target.value)}
          style={textFieldStyle}
          {...rest}
        />
      </div>
    );
  } else {
    return <React.Fragment />;
  }
};

export default TypeToConfirm;
