import * as React from 'react';
import { Accordion } from 'src/components/Accordion';
import { Box } from 'src/components/Box';
import { Link } from 'src/components/Link';
import { Notice } from 'src/components/Notice/Notice';
import { TextField } from 'src/components/TextField';
import { Typography } from 'src/components/Typography';
import { CreateTypes } from 'src/store/linodeCreate/linodeCreate.actions';
import { useExpandIconStyles } from './UserDataAccordion.styles';
import { UserDataAccordionHeading } from './UserDataAccordionHeading';

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
      detailProps={{ sx: sxDetails }}
      expandIconClassNames={fromBackupOrFromLinode ? expandIconStyles : ''}
      heading={<UserDataAccordionHeading createType={createType} />}
      headingProps={{
        variant: 'h2',
      }}
      style={{
        marginTop: renderNotice && renderCheckbox ? 0 : 24,
      }} // for now, these props can be taken as an indicator we're in the Rebuild flow.
      summaryProps={{
        sx: {
          padding: '5px 24px 0px 24px',
          alignItems: fromBackupOrFromLinode ? 'flex-start' : 'center',
        },
      }}
      sx={{
        '&:before': {
          display: 'none',
        },
      }}
    >
      {renderNotice ? (
        <Box marginBottom="16px" data-testid="render-notice">
          {renderNotice}
        </Box>
      ) : null}
      <Typography sx={{ marginBottom: 1 }}>
        User data is a feature of the Metadata service that enables you to
        perform system configuration tasks (such as adding users and installing
        software) by providing custom instructions or scripts to cloud-init. Any
        user data should be added at this step and cannot be modified after the
        the Linode has been created.{' '}
        <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/metadata/">
          Learn more.
        </Link>{' '}
      </Typography>
      {formatWarning ? (
        <Notice warning spacingTop={16} spacingBottom={16}>
          The User Data may be formatted incorrectly.
        </Notice>
      ) : null}
      <TextField
        disabled={Boolean(disabled)}
        expand
        label="User Data"
        labelTooltipText="Compatible formats include cloud-config data and executable scripts."
        multiline
        onBlur={(e) =>
          checkFormat({ userData: e.target.value, hasInputValueChanged: false })
        }
        onChange={(e) => {
          checkFormat({ userData: e.target.value, hasInputValueChanged: true });
          onChange(e.target.value);
        }}
        rows={1}
        value={userData}
        data-qa-user-data-input
      />
      {renderCheckbox ?? null}
    </Accordion>
  );
};
