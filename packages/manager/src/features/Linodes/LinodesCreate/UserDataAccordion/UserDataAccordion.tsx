import * as React from 'react';
import Box from 'src/components/core/Box';
import Accordion from 'src/components/Accordion';
import Link from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import TextField from 'src/components/TextField';
import Typography from 'src/components/core/Typography';
import { UserDataAccordionHeading } from './UserDataAccordionHeading';
import { useExpandIconStyles } from './UserDataAccordion.styles';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';

interface Props {
  createType?: CreateTypes;
  userData: string | undefined;
  onChange: (userData: string) => void;
  disabled?: boolean;
  renderNotice?: JSX.Element;
  renderCheckbox?: JSX.Element;
}

export const UserDataAccordion = (props: Props) => {
  const { expandIconStyles } = useExpandIconStyles();
  const {
    createType,
    disabled,
    userData,
    onChange,
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
    if (userData.length > 0 && !isUserDataValid && !hasInputValueChanged) {
      setFormatWarning(true);
    } else {
      setFormatWarning(false);
    }
  };

  const sxDetails = {
    padding: `0px 24px 24px ${renderNotice ? 0 : 24}px`,
  };

  const fromBackupOrFromLinode =
    createType && ['fromBackup', 'fromLinode'].includes(createType);

  return (
    <Accordion
      heading={<UserDataAccordionHeading createType={createType} />}
      style={{
        marginTop: renderNotice && renderCheckbox ? 0 : 24,
      }} // for now, these props can be taken as an indicator we're in the Rebuild flow.
      headingProps={{
        variant: 'h2',
      }}
      summaryProps={{
        sx: {
          padding: '5px 24px 0px 24px',
          alignItems: fromBackupOrFromLinode ? 'flex-start' : 'center',
        },
      }}
      detailProps={{ sx: sxDetails }}
      sx={{
        '&:before': {
          display: 'none',
        },
      }}
      expandIconClassNames={fromBackupOrFromLinode ? expandIconStyles : ''}
    >
      {renderNotice ? (
        <Box marginBottom="16px" data-testid="render-notice">
          {renderNotice}
        </Box>
      ) : null}
      <Typography sx={{ marginBottom: 3 }}>
        User data is a virtual machine&rsquo;s cloud-init metadata relating to a
        user&rsquo;s local account, including username and user group(s). <br />
        User data must be added before the Linode provisions.{' '}
        <Link to="http://linode.com/docs">Learn more.</Link>{' '}
      </Typography>
      {formatWarning ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          The user data may be formatted incorrectly.
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
      {renderCheckbox ?? null}
    </Accordion>
  );
};
