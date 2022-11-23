import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { decode } from 'he';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import SelectionCardWrapper from 'src/features/linodes/LinodesCreate/SelectionCardWrapper';
import Chip from 'src/components/core/Chip';

const useStyles = makeStyles((theme: Theme) => ({
  flatImagePanelSelections: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    padding: `${theme.spacing(1)}px 0`,
  },
  chip: {
    '& span': {
      color: 'inherit !important',
    },
  },
}));

interface Props {
  heading?: string;
  apps: StackScript[];
  disabled: boolean;
  selectedStackScriptID: number | undefined;
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
  } = props;
  const classes = useStyles();

  return (
    <>
      <Typography variant="h2">{heading}</Typography>
      {heading && heading.length > 0 ? (
        <Divider spacingTop={16} spacingBottom={16} />
      ) : null}
      <Grid className={classes.flatImagePanelSelections} container>
        {apps.map((eachApp) => {
          const decodedLabel = decode(eachApp.label);
          const isCluster =
            decodedLabel.endsWith('Cluster ') &&
            eachApp.user_defined_fields.some(
              (field) => field.name === 'node_options'
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
              availableImages={eachApp.images}
              userDefinedFields={eachApp.user_defined_fields}
              handleClick={handleClick}
              openDrawer={openDrawer}
              disabled={disabled}
              iconUrl={eachApp.logo_url.toLowerCase() || ''}
              labelDecoration={
                isCluster ? (
                  <Chip size="small" label="CLUSTER" className={classes.chip} />
                ) : undefined
              }
            />
          );
        })}
      </Grid>
    </>
  );
};

export default AppPanelSection;
