import * as React from 'react';
import Accordion from 'src/components/Accordion';
import TextField from 'src/components/TextField';
import Notice from 'src/components/Notice';
import AcceptedFormats from './AcceptedFormats';
import UserDataAccordionHeading from './UserDataAccordionHeading';
import UserDataExplanatory from './UserDataExplanatory';

interface Props {
  createType?: string;
  userData: string | undefined;
  onChange: (userData: string) => void;
  disabled?: boolean;
  renderNotice?: JSX.Element;
  renderCheckbox?: JSX.Element;
}

const UserDataAccordion = (props: Props) => {
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

  return (
    <Accordion
      heading={<UserDataAccordionHeading createType={createType} />}
      style={{ marginTop: renderNotice && renderCheckbox ? 0 : 24 }} // for now, these props can be taken as an indicator we're in the Rebuild flow.
      headingProps={{
        variant: 'h2',
      }}
      summaryProps={{
        sx: { padding: '5px 24px 0px 24px' },
      }}
      detailProps={{ sx: sxDetails }}
      sx={{
        '&:before': {
          display: 'none',
        },
      }}
    >
      {renderNotice ? (
        <div data-testid="render-notice">{renderNotice}</div>
      ) : (
        <UserDataExplanatory />
      )}
      <AcceptedFormats />
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
      {renderCheckbox ?? null}
    </Accordion>
  );
};

export default UserDataAccordion;
