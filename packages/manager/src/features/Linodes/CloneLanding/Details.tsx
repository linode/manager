import { useRegionsQuery } from '@linode/queries';
import { LinodeSelect } from '@linode/shared';
import {
  ActionsPanel,
  Button,
  Divider,
  List,
  ListItem,
  Notice,
  Paper,
  Typography,
} from '@linode/ui';
import Close from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';

import { Link } from 'src/components/Link';

import {
  StyledButton,
  StyledDiv,
  StyledHeader,
  StyledTypography,
} from './Details.styles';
import { getAllDisks, getEstimatedCloneTime } from './utilities';

import type { EstimatedCloneTimeMode, ExtendedConfig } from './utilities';
import type { Disk, Linode } from '@linode/api-v4/lib/linodes';

interface Props {
  clearAll: () => void;
  currentLinodeId: number;
  errorMap: Record<string, string | undefined>;
  handleCancel: () => void;
  handleClone: () => void;
  handleSelectLinode: (linodeId: number) => void;
  handleToggleConfig: (id: number) => void;
  handleToggleDisk: (id: number) => void;
  isSubmitting: boolean;
  selectedConfigs: ExtendedConfig[];
  selectedDisks: Disk[];
  selectedLinodeId: null | number;
  selectedLinodeRegion?: string;
  thisLinodeRegion: string;
}

export const Details = (props: Props) => {
  const {
    clearAll,
    currentLinodeId,
    errorMap,
    handleCancel,
    handleClone,
    handleSelectLinode,
    handleToggleConfig,
    handleToggleDisk,
    isSubmitting,
    selectedConfigs,
    selectedDisks,
    selectedLinodeId,
    selectedLinodeRegion,
    thisLinodeRegion,
  } = props;

  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === thisLinodeRegion);

  const theme = useTheme();

  const noneError = errorMap.none;
  // When duplicating a disk on the SAME Linode, if there's not a enough space,
  // we get back an error with a field of "disk_size"
  const diskError = errorMap.disk_size;

  /**
   * When cloning a disk or config to a DIFFERENT Linode, if there's not enough space on the destination Linode,
   * we get an error from the API that looks like this: `[{ "reason": "Not enough free space on <label>." }]`.
   * There's no "field" on this error , but we want this error to appear as a field error on the LinodeSelect.
   *
   * If the API error message ever changes and this regex breaks, the worst that will happen is that
   * the error will appear as a general error (<Notice />) instead of a field error.
   */
  const isNoneErrorActuallyALinodeError = Boolean(
    noneError && noneError.match(/free space/)
  );

  // The Linode field error could either be the none error, or the disk_size error (or nothing).
  let linodeError = isNoneErrorActuallyALinodeError ? noneError : diskError;
  // Ensure there is a period at the end of the error.
  if (linodeError && !linodeError.endsWith('.')) {
    linodeError += '.';
  }

  const errorMessageLinks = {
    resize: `/linodes/${selectedLinodeId}/resize`,
    shrink: `/linodes/${selectedLinodeId}/advanced`,
  };

  /**
   * Don't include the current Linode in the LinodeSelect component if:
   * 1) There is a selected config (because you can't duplicate configs on the same Linode).
   * 2) There's more than one disk selected (because you can't duplicate multiple configs at once on the same Linode).
   */
  const shouldExcludeCurrentLinode =
    selectedConfigs.length > 0 || selectedDisks.length > 1;

  // Disable the "Clone" button if there is no selected Linode,
  // or if there are no selected configs or disks, or if the selected Linode should be excluded.
  const isCloneButtonDisabled =
    (selectedConfigs.length === 0 && selectedDisks.length === 0) ||
    !selectedLinodeId ||
    (shouldExcludeCurrentLinode && selectedLinodeId === currentLinodeId);

  // Estimate the clone time (need to grab all disks first).
  const allDisks = getAllDisks(selectedConfigs, selectedDisks);
  const totalSize = allDisks.reduce((sum, eachDisk) => {
    return sum + eachDisk.size;
  }, 0);

  const mode: EstimatedCloneTimeMode =
    thisLinodeRegion === selectedLinodeRegion
      ? 'sameDatacenter'
      : 'differentDatacenter';
  const estimatedCloneTime = getEstimatedCloneTime(totalSize, mode);

  return (
    <Paper
      data-testid="config-clone-selection-details"
      sx={{ padding: theme.spacing(2) }}
    >
      <StyledHeader>
        <Typography variant="h2">Selected</Typography>
        <Button
          buttonType="secondary"
          compactX
          onClick={clearAll}
          sx={{ top: `-${theme.spacing(0.5)}` }}
        >
          Clear
        </Button>
      </StyledHeader>

      {noneError && !isNoneErrorActuallyALinodeError && (
        <Notice text={noneError} variant="error" />
      )}

      <List>
        {selectedConfigs.map((eachConfig) => {
          return (
            <ListItem
              dense
              disableGutters
              key={eachConfig.id}
              sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <StyledDiv>
                <Typography variant="h3">{eachConfig.label}</Typography>
                <StyledButton
                  data-qa-inline-delete
                  onClick={() => handleToggleConfig(eachConfig.id)}
                >
                  <Close />
                </StyledButton>
              </StyledDiv>
              <List sx={{ flexBasis: '100%', marginLeft: theme.spacing(2) }}>
                {eachConfig.associatedDisks.map((eachDisk) => {
                  return (
                    <ListItem dense disableGutters key={eachDisk.label}>
                      <Typography>{eachDisk.label}</Typography>
                    </ListItem>
                  );
                })}
              </List>
            </ListItem>
          );
        })}
      </List>
      <List>
        {selectedDisks.map((eachDisk) => {
          return (
            <ListItem
              dense
              disableGutters
              key={eachDisk.id}
              sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
            >
              <Typography variant="h3">{eachDisk.label}</Typography>
              <StyledButton
                data-qa-inline-delete
                onClick={() => handleToggleDisk(eachDisk.id)}
              >
                <Close />
              </StyledButton>
            </ListItem>
          );
        })}
      </List>

      {(selectedConfigs.length > 0 || selectedDisks.length > 0) && (
        <Divider spacingBottom={16} spacingTop={16} />
      )}

      <Typography data-testid={`current-datacenter-${region?.id}`}>
        Current Data Center: {region?.label ?? thisLinodeRegion}
      </Typography>

      {/* Show the estimated clone time if we're able to submit the form. */}
      {!isCloneButtonDisabled && (
        <Typography>Estimated time: {estimatedCloneTime}</Typography>
      )}

      <LinodeSelect
        onSelectionChange={(linode) => {
          if (linode !== null) {
            handleSelectLinode(linode.id);
          }
        }}
        optionsFilter={
          shouldExcludeCurrentLinode
            ? (linode: Linode) => linode.id !== currentLinodeId
            : undefined
        }
        clearable={false}
        errorText={linodeError}
        placeholder="Destination"
        value={selectedLinodeId}
      />

      {linodeError && (
        <StyledTypography variant="body1">
          {linodeError}{' '}
          <Link to={errorMessageLinks.shrink}>Shrink your existing disks</Link>{' '}
          or{' '}
          <Link to={errorMessageLinks.resize}>
            resize your Linode to a larger plan.
          </Link>
        </StyledTypography>
      )}
      <ActionsPanel
        primaryButtonProps={{
          disabled: isCloneButtonDisabled,
          label: 'Clone',
          loading: isSubmitting,
          onClick: handleClone,
        }}
        secondaryButtonProps={{
          label: 'Cancel',
          onClick: handleCancel,
        }}
      />
    </Paper>
  );
};
