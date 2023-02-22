import * as React from 'react';
import Accordion from 'src/components/Accordion';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import TextField from 'src/components/TextField';

interface Props {
  userData: string | undefined;
  onChange: (userData: string) => void;
  disabled?: boolean;
}

const useStyles = makeStyles(() => ({
  helpIcon: {
    padding: '0px 0px 4px 8px',
    '& svg': {
      fill: 'currentColor',
      stroke: 'none',
    },
  },
}));

const UserDataAccordion: React.FC<Props> = (props) => {
  const { disabled, userData, onChange } = props;
  const classes = useStyles();

  const accordionHeading = (
    <>
      Add User Data{' '}
      <HelpIcon
        text={'Definition of user data and what it is used for'}
        className={classes.helpIcon}
        interactive
      />
    </>
  );

  return (
    <Accordion heading={accordionHeading} style={{ marginTop: 24 }}>
      <Typography>
        Paste user data into the field below. Formats accepted are YAML and
        bash. Helper text with links to docs and guides.
      </Typography>
      <TextField
        label="User Data"
        multiline
        rows={1}
        expand
        onChange={(e) => onChange(e.target.value)}
        value={userData}
        disabled={Boolean(disabled)}
        data-qa-user-data-input
      />
    </Accordion>
  );
};

export default UserDataAccordion;
