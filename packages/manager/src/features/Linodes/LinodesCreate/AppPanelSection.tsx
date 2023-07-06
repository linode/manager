import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import { decode } from 'he';
import * as React from 'react';
import { Divider } from 'src/components/Divider';
import { Typography } from 'src/components/Typography';
import { Chip } from 'src/components/Chip';
import SelectionCardWrapper from 'src/features/Linodes/LinodesCreate/SelectionCardWrapper';

const AppPanelGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(),
  padding: `${theme.spacing(1)} 0`,
}));

interface Props {
  heading?: string;
  apps: StackScript[];
  disabled: boolean;
  selectedStackScriptID: number | undefined;
  searchValue?: string;
  openDrawer: (stackScriptLabel: string) => void;
  handleClick: (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => void;
}

export const AppPanelSection: React.FC<Props> = (props) => {
  const {
    heading,
    apps,
    selectedStackScriptID,
    disabled,
    openDrawer,
    handleClick,
    searchValue,
  } = props;

  if (heading === 'New apps' && !apps.length) {
    return null;
  }

  return (
    <>
      <Typography variant="h2">{heading}</Typography>
      {heading && heading.length > 0 ? (
        <Divider spacingTop={16} spacingBottom={16} />
      ) : null}
      {apps.length > 0 ? (
        <AppPanelGrid container spacing={2}>
          {apps.map((eachApp) => {
            const decodedLabel = decode(eachApp.label);
            const isCluster =
              decodedLabel.endsWith('Cluster ') &&
              eachApp.user_defined_fields.some(
                (field) => field.name === 'cluster_size'
              );

            const label = isCluster
              ? decodedLabel.split(' Cluster')[0]
              : decodedLabel;

            return (
              <SelectionCardWrapper
                id={eachApp.id}
                key={eachApp.id}
                checked={eachApp.id === selectedStackScriptID}
                // Decode App labels since they may contain HTML entities.
                label={label}
                clusterLabel={decodedLabel}
                availableImages={eachApp.images}
                userDefinedFields={eachApp.user_defined_fields}
                handleClick={handleClick}
                openDrawer={openDrawer}
                disabled={disabled}
                iconUrl={eachApp.logo_url.toLowerCase() || ''}
                labelDecoration={
                  isCluster ? <Chip size="small" label="CLUSTER" /> : undefined
                }
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

export default AppPanelSection;
