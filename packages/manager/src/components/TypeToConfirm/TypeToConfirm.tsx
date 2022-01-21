import * as React from 'react';
import Typography from 'src/components/core/Typography';
import TextField from 'src/components/TextField';

export interface Props {
  confirmationText: JSX.Element | string;
  updateString: (str: string) => void;
  label: string;
  hideLabel?: boolean;
  textFieldStyle?: Record<string, any>;
  typographyStyle?: Record<string, any>;
}

type CombinedProps = Props;

const TypeToConfirm: React.FC<CombinedProps> = (props) => {
  const {
    confirmationText,
    updateString,
    label,
    hideLabel,
    textFieldStyle,
    typographyStyle,
  } = props;
  return (
    <div>
      <Typography style={typographyStyle}>{confirmationText}</Typography>
      <TextField
        label={label}
        hideLabel={hideLabel}
        onChange={(e) => updateString(e.target.value)}
        style={textFieldStyle}
      />
    </div>
  );
};

export default TypeToConfirm;
