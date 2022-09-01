import * as React from 'react';
import CheckBox from 'src/components/CheckBox';
import FormControlLabel from 'src/components/core/FormControlLabel';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Link from 'src/components/Link';
import PreferenceToggle, { ToggleProps } from 'src/components/PreferenceToggle';
import TextField from 'src/components/TextField';

export interface Props {
  confirmationText?: JSX.Element | string;
  onChange: (str: string) => void;
  label: string;
  hideDisable?: boolean;
  hideLabel?: boolean;
  textFieldStyle?: React.CSSProperties;
  typographyStyle?: React.CSSProperties;
  visible?: boolean | undefined;
  title?: string;
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
    hideDisable,
    visible,
    ...rest
  } = props;

  const classes = useStyles();

  if (visible !== false) {
    const preferenceToggle = (
      <PreferenceToggle<boolean>
        preferenceKey="type_to_confirm"
        preferenceOptions={[true, false]}
        localStorageKey="typeToConfirm"
      >
        {({
          preference: istypeToConfirm,
          togglePreference: toggleTypeToConfirm,
        }: ToggleProps<boolean>) => {
          return (
            <Grid container alignItems="center">
              <Grid item xs={12} style={{ marginLeft: 2 }}>
                <FormControlLabel
                  control={
                    <CheckBox
                      onChange={toggleTypeToConfirm}
                      checked={!istypeToConfirm}
                      inputProps={{
                        'aria-label': `Disable type-to-confirm`,
                      }}
                    />
                  }
                  label="Disable type-to-confirm"
                />
              </Grid>
            </Grid>
          );
        }}
      </PreferenceToggle>
    );

    return (
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
        {!hideDisable && preferenceToggle}
      </>
    );
  } else {
    return (
      <Typography className={classes.description}>
        To enable type-to-confirm, go to{' '}
        <Link to="/profile/settings">My Settings</Link>.
      </Typography>
    );
  }
};

export default TypeToConfirm;
