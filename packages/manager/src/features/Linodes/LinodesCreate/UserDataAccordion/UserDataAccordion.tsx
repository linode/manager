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

export interface UserDataAccordionProps {
  createType?: CreateTypes;
  disabled?: boolean;
  onChange: (userData: string) => void;
  renderCheckbox?: JSX.Element;
  renderNotice?: JSX.Element;
  userData: string | undefined;
}

export const UserDataAccordion = (props: UserDataAccordionProps) => {
  const { classes, cx } = useExpandIconStyles();
  const {
    createType,
    disabled,
    onChange,
    renderCheckbox,
    renderNotice,
    userData,
  } = props;
  const [formatWarning, setFormatWarning] = React.useState(false);

  const checkFormat = ({
    hasInputValueChanged,
    userData,
  }: {
    hasInputValueChanged: boolean;
    userData: string;
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
      headingProps={{
        variant: 'h2',
      }}
      style={{
        marginTop: renderNotice && renderCheckbox ? 0 : 24,
      }} // for now, these props can be taken as an indicator we're in the Rebuild flow.
      summaryProps={{
        sx: {
          alignItems: fromBackupOrFromLinode ? 'flex-start' : 'center',
          padding: '5px 24px 0px 24px',
        },
      }}
      sx={{
        '&:before': {
          display: 'none',
        },
      }}
      detailProps={{ sx: sxDetails }}
      expandIconClassNames={cx({
        [classes.expandIconStyles]: !!fromBackupOrFromLinode,
      })}
      heading={<UserDataAccordionHeading createType={createType} />}
    >
      {renderNotice ? (
        <Box data-testid="render-notice" marginBottom="16px">
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
        <Notice spacingBottom={16} spacingTop={16} warning>
          The user data may be formatted incorrectly.
        </Notice>
      ) : null}
      <TextField
        onBlur={(e) =>
          checkFormat({ hasInputValueChanged: false, userData: e.target.value })
        }
        onChange={(e) => {
          checkFormat({ hasInputValueChanged: true, userData: e.target.value });
          onChange(e.target.value);
        }}
        data-qa-user-data-input
        disabled={Boolean(disabled)}
        expand
        label="User Data"
        labelTooltipText="Compatible formats include cloud-config data and executable scripts."
        multiline
        rows={1}
        value={userData}
      />
      {renderCheckbox ?? null}
    </Accordion>
  );
};
