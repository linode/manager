import * as React from 'react';
import Button from 'src/components/Button';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Select, { Item } from 'src/components/EnhancedSelect/Select';
import Notice from 'src/components/Notice';
import usePreferences from 'src/hooks/usePreferences';

export const useStyles = makeStyles((theme: Theme) => ({
  buttonContainer: {
    gap: theme.spacing(),
    [theme.breakpoints.down('sm')]: {
      marginTop: theme.spacing(2),
    },
  },
}));

const options: Item[] = [
  { label: '10 seconds', value: 1000 * 10 },
  { label: '15 minutes ', value: 1000 * 60 * 15 },
  { label: '30 minutes ', value: 1000 * 60 * 30 },
  { label: '60 minutes ', value: 1000 * 60 * 60 },
  { label: 'No timeout', value: 0 },
];

const SessionTimeoutSettings: React.FC<{}> = () => {
  const classes = useStyles();

  const {
    preferences,
    preferencesLoading,
    preferencesError,
    updatePreferences,
  } = usePreferences();

  const initialSelected =
    options.find((opt) => opt.value === preferences?.idle_session_timeout) ??
    options[options.length - 1];

  const [selected, setSelected] = React.useState<Item>(initialSelected);
  const [changed, setChanged] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  return (
    <>
      {preferencesError?.update ? (
        <Notice spacingTop={16} text="An error occurred" error />
      ) : null}
      {success ? (
        <Notice
          spacingTop={16}
          text="Successfully updated your session length"
          informational
        />
      ) : null}
      <Select
        options={options}
        value={selected}
        isClearable={false}
        onChange={(selected: Item) => {
          setChanged(true);
          setSelected(selected);
        }}
      />
      <Box
        display="flex"
        justifyContent="flex-end"
        className={classes.buttonContainer}
      >
        <Button
          buttonType="primary"
          disabled={!changed}
          loading={preferencesLoading}
          onClick={() => {
            setChanged(false);
            updatePreferences({
              idle_session_timeout: Number(selected.value),
            }).then(() => {
              setSuccess(true);
            });
          }}
        >
          Save
        </Button>
      </Box>
    </>
  );
};

export default SessionTimeoutSettings;
