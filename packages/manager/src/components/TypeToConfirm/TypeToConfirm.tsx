import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Link from 'src/components/Link';
import TextField from 'src/components/TextField';

export interface Props {
  confirmationText?: JSX.Element | string;
  onChange: (str: string) => void;
  label: string;
  hideLabel?: boolean;
  textFieldStyle?: React.CSSProperties;
  typographyStyle?: React.CSSProperties;
  visible?: boolean | undefined;
  title?: string;
  hideInstructions?: boolean;
  // This is a string index signature.
  // This means that all properties in 'Props' are assignable to any
  [propName: string]: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  description: {
    marginTop: theme.spacing(),
  },
}));

const TypeToConfirm: React.FC<Props> = (props) => {
  const {
    confirmationText,
    onChange,
    label,
    hideLabel,
    textFieldStyle,
    typographyStyle,
    title,
    visible,
    hideInstructions,
    ...rest
  } = props;

  const classes = useStyles();

  /*
    There was an edge case bug where, when preferences?.type_to_confirm was undefined,
    the type-to-confirm input did not appear and the language in the instruction text
    did not match. If 'visible' is not explicitly false, we treat it as true.
  */

  const showTypeToConfirmInput = visible !== false;
  const disableOrEnable = showTypeToConfirmInput ? 'disable' : 'enable';

  return (
    <>
      {showTypeToConfirmInput ? (
        <>
          <Typography variant="h2">{title}</Typography>
          <Typography style={typographyStyle}>{confirmationText}</Typography>
          <TextField
            label={label}
            hideLabel={hideLabel}
            onChange={(e) => onChange(e.target.value)}
            style={textFieldStyle}
            {...rest}
          />
        </>
      ) : null}
      {!hideInstructions ? (
        <Typography className={classes.description}>
          To {disableOrEnable} type-to-confirm, go to the Type-to-Confirm
          section of <Link to="/profile/settings">My Settings</Link>.
        </Typography>
      ) : null}
    </>
  );
};

export default TypeToConfirm;
