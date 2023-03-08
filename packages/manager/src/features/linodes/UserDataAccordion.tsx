import { styled } from '@mui/material/styles';
import * as React from 'react';
import Accordion from 'src/components/Accordion';
import CheckBox from 'src/components/CheckBox';
import Box from 'src/components/core/Box';
import Typography from 'src/components/core/Typography';
import HelpIcon from 'src/components/HelpIcon';
import Link from 'src/components/Link';
import Notice from 'src/components/Notice';
import TextField from 'src/components/TextField';

interface Props {
  userData: string | undefined;
  onChange: (userData: string) => void;
  disabled?: boolean;
  reuseUserData?: boolean;
  onReuseUserDataChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  renderNotice?: boolean;
  renderCheckbox?: boolean;
}

const StyledHelpIcon = styled(HelpIcon)({
  padding: '0px 0px 4px 8px',
  '& svg': {
    fill: 'currentColor',
    stroke: 'none',
  },
});

const accordionHeading = (
  <>
    Add User Data{' '}
    <StyledHelpIcon
      text={
        <>
          User data is part of a virtual machine&rsquo;s cloud-init metadata
          containing information related to a user&rsquo;s local account.{' '}
          <Link to="/">Learn more.</Link>
        </>
      }
      interactive
    />
  </>
);

const StyledBox = styled(Box)({
  '.MuiFormControlLabel-root': {
    paddingLeft: 2,
  },
});

const StyledDiv = styled('div')({
  '& .notice': {
    padding: '8px !important',
    marginBottom: '0px !important',
  },
});

const UserDataAccordion = (props: Props) => {
  const {
    disabled,
    userData,
    onChange,
    reuseUserData,
    onReuseUserDataChange,
    renderNotice,
    renderCheckbox,
  } = props;
  const [formatWarning, setFormatWarning] = React.useState(false);

  const checkFormat = ({
    userData,
    hasInputValueChanged,
  }: {
    userData: string;
    hasInputValueChanged: boolean;
  }) => {
    const userDataLower = userData.toLowerCase();
    const validPrefixes = ['#cloud-config', 'content-type: text/', '#!/bin/'];
    const isUserDataValid = validPrefixes.some((prefix) =>
      userDataLower.startsWith(prefix)
    );
    if (userData.length > 0 && !isUserDataValid) {
      if (!hasInputValueChanged) {
        setFormatWarning(true);
      }
    } else {
      setFormatWarning(false);
    }
  };

  return (
    <Accordion
      heading={accordionHeading}
      style={{ marginTop: renderNotice && renderCheckbox ? 0 : 24 }} // for now, these props can be taken as an indicator we're in the Rebuild flow.
      headingProps={{
        variant: 'h2',
      }}
      summaryProps={{
        sx: { padding: '5px 24px 0px 24px' },
      }}
      detailProps={{
        sx: renderNotice
          ? { padding: '0px 24px 24px 0px' }
          : { padding: '0px 24px 24px 24px' },
      }}
      sx={{
        '&:before': {
          display: 'none',
        },
      }}
    >
      {renderNotice ? (
        <StyledDiv>
          <Notice
            success
            text="Adding new user data is recommended as part of the rebuild process."
          />
          {acceptedFormatsCopy}
        </StyledDiv>
      ) : (
        <>
          {userDataExplanatoryCopy}
          {acceptedFormatsCopy}
        </>
      )}
      {formatWarning ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          This user data may not be in a format accepted by cloud-init.
        </Notice>
      ) : null}
      <TextField
        label="User Data"
        multiline
        rows={1}
        expand
        onChange={(e) => {
          checkFormat({ userData: e.target.value, hasInputValueChanged: true });
          onChange(e.target.value);
        }}
        value={userData}
        disabled={Boolean(disabled)}
        onBlur={(e) =>
          checkFormat({ userData: e.target.value, hasInputValueChanged: false })
        }
        data-qa-user-data-input
      />
      {renderCheckbox ? (
        <StyledBox>
          <CheckBox
            checked={reuseUserData}
            onChange={onReuseUserDataChange}
            text="Reuse user data previously provided for this Linode."
          />
        </StyledBox>
      ) : null}
    </Accordion>
  );
};

export default UserDataAccordion;

const userDataExplanatoryCopy = (
  <Typography>
    <Link to="https://cloudinit.readthedocs.io/en/latest/reference/examples.html">
      User Data
    </Link>{' '}
    is part of a virtual machine&rsquo;s cloud-init metadata that contains
    anything related to a user&rsquo;s local account, including username and
    user group(s).
  </Typography>
);

const acceptedFormatsCopy = (
  <Typography>
    <br /> Accepted formats are YAML and bash.{' '}
    <Link to="https://www.linode.com/docs">Learn more.</Link>
  </Typography>
);
