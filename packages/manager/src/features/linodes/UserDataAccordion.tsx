import * as React from 'react';
import Accordion from 'src/components/Accordion';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import HelpIcon from 'src/components/HelpIcon';
import Notice from 'src/components/Notice';
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
  const [formatWarning, setFormatWarning] = React.useState(false);

  const classes = useStyles();

  const checkFormat = (userData: string, isOnChange: boolean) => {
    const userDataLower = userData.toLowerCase();
    if (
      userData.length > 0 &&
      !userDataLower.startsWith('#cloud-config') &&
      !userDataLower.startsWith('content-type: text/') &&
      !userDataLower.startsWith('#!')
    ) {
      if (!isOnChange) {
        setFormatWarning(true);
      }
    } else {
      setFormatWarning(false);
    }
  };

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
      {formatWarning ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          This user data may not be in a format accepted by cloud-init. See{' '}
          <ExternalLink
            text="cloud-init documentation"
            link="https://cloudinit.readthedocs.io/en/latest/explanation/format.html"
            fixedIcon
          />{' '}
          for more information.
        </Notice>
      ) : null}
      <TextField
        label="User Data"
        multiline
        rows={1}
        expand
        onChange={(e) => {
          checkFormat(e.target.value, true);
          onChange(e.target.value);
        }}
        value={userData}
        disabled={Boolean(disabled)}
        onBlur={(e) => checkFormat(e.target.value, false)}
        data-qa-user-data-input
      />
    </Accordion>
  );
};

export default UserDataAccordion;
