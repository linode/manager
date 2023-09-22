import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import { Chip } from 'src/components/Chip';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { SelectionCardWrapper } from 'src/features/Linodes/LinodesCreate/SelectionCardWrapper';

import { handleAppLabel } from './utilities';

interface Props {
  apps: StackScript[];
  disabled: boolean;
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
  heading?: string;
  openDrawer: (stackScriptLabel: string) => void;
  searchValue?: string;
  selectedStackScriptID: number | undefined;
}

export const AppPanelSection = (props: Props) => {
  const {
    apps,
    disabled,
    handleClick,
    heading,
    openDrawer,
    searchValue,
    selectedStackScriptID,
  } = props;

  if (heading === 'New apps' && !apps.length) {
    return null;
  }

  return (
    <>
      <Typography variant="h2">{heading}</Typography>
      {heading && heading.length > 0 ? (
        <Divider spacingBottom={16} spacingTop={16} />
      ) : null}
      {apps.length > 0 ? (
        <AppPanelGrid container spacing={2}>
          {apps.map((eachApp) => {
            const { decodedLabel, isCluster, label } = handleAppLabel(eachApp);

            return (
              <SelectionCardWrapper
                labelDecoration={
                  isCluster ? <Chip label="CLUSTER" size="small" /> : undefined
                }
                availableImages={eachApp.images}
                checked={eachApp.id === selectedStackScriptID}
                clusterLabel={decodedLabel}
                disabled={disabled}
                handleClick={handleClick}
                iconUrl={eachApp.logo_url.toLowerCase() || ''}
                id={eachApp.id}
                key={eachApp.id}
                // Decode App labels since they may contain HTML entities.
                label={label}
                openDrawer={openDrawer}
                userDefinedFields={eachApp.user_defined_fields}
              />
            );
          })}
        </AppPanelGrid>
      ) : (
        <Typography>
          {`Sorry, no results matching "${searchValue}" were found.`}
        </Typography>
      )}
    </>
  );
};

const AppPanelGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(),
  marginTop: theme.spacing(2),
  padding: `${theme.spacing(1)} 0`,
}));
