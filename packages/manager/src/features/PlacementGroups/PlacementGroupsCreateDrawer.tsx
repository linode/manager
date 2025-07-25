import {
  useAllPlacementGroupsQuery,
  useCreatePlacementGroup,
  useRegionsQuery,
} from '@linode/queries';
import { useIsGeckoEnabled } from '@linode/shared';
import {
  ActionsPanel,
  Divider,
  Drawer,
  List,
  ListItem,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import {
  scrollErrorIntoView,
  useFormValidateOnChange,
} from '@linode/utilities';
import { createPlacementGroupSchema } from '@linode/validation';
import { useLocation } from '@tanstack/react-router';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';

import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFlags } from 'src/hooks/useFlags';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';

import { MAXIMUM_NUMBER_OF_PLACEMENT_GROUPS_IN_REGION } from './constants';
import { PlacementGroupPolicyRadioGroup } from './PlacementGroupPolicyRadioGroup';
import { PlacementGroupTypeSelect } from './PlacementGroupTypeSelect';
import {
  getMaxPGsPerCustomer,
  hasRegionReachedPlacementGroupCapacity,
} from './utils';

import type { PlacementGroupsCreateDrawerProps } from './types';
import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
  Region,
} from '@linode/api-v4';
import type { DisableItemOption } from '@linode/ui';
import type { LinodeCreateType } from '@linode/utilities';
import type { FormikHelpers } from 'formik';

export const PlacementGroupsCreateDrawer = (
  props: PlacementGroupsCreateDrawerProps
) => {
  const {
    disabledPlacementGroupCreateButton,
    onClose,
    onPlacementGroupCreate,
    open,
    selectedRegionId,
  } = props;
  const flags = useFlags();
  const { isGeckoLAEnabled } = useIsGeckoEnabled(
    flags.gecko2?.enabled,
    flags.gecko2?.la
  );
  const { data: regions } = useRegionsQuery();
  const { data: allPlacementGroupsInRegion } = useAllPlacementGroupsQuery({
    enabled: Boolean(selectedRegionId),
    filter: {
      region: selectedRegionId,
    },
  });
  const { error, mutateAsync } = useCreatePlacementGroup();
  const { enqueueSnackbar } = useSnackbar();
  const { hasFormBeenSubmitted, setHasFormBeenSubmitted } =
    useFormValidateOnChange();

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');

  const handleRegionSelect = (region: Region['id']) => {
    setFieldValue('region', region);
  };

  const handleResetForm = () => {
    resetForm();
    setHasFormBeenSubmitted(false);
  };

  const handleDrawerClose = () => {
    onClose();
    handleResetForm();
  };

  const handleFormSubmit = async (
    values: CreatePlacementGroupPayload,
    { setErrors, setStatus }: FormikHelpers<CreatePlacementGroupPayload>
  ) => {
    setHasFormBeenSubmitted(false);
    setStatus(undefined);
    setErrors({});

    try {
      const response = await mutateAsync(values);

      enqueueSnackbar(`Placement Group ${values.label} successfully created.`, {
        variant: 'success',
      });

      if (onPlacementGroupCreate) {
        onPlacementGroupCreate(response);
        // Fire analytics form submit upon successful PG creation from Linode Create flow.
        if (isFromLinodeCreate) {
          sendLinodeCreateFormStepEvent({
            createType: (location.search.type as LinodeCreateType) ?? 'OS',
            headerName: 'Create Placement Group',
            interaction: 'click',
            label: 'Create Placement Group',
          });
        }
      }
      handleResetForm();
      onClose();
    } catch (errors) {
      setErrors(getFormikErrorsFromAPIErrors(errors));
      scrollErrorIntoView();
    }
  };

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    resetForm,
    setFieldValue,
    values,
  } = useFormik({
    enableReinitialize: true,
    initialValues: {
      label: '',
      placement_group_policy:
        'strict' as PlacementGroup['placement_group_policy'],
      placement_group_type:
        'anti_affinity:local' as PlacementGroup['placement_group_type'],
      region: selectedRegionId ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
  });

  const hasApiError = error?.[0]?.reason;

  const selectedRegion = React.useMemo(
    () => regions?.find((region) => region.id === values.region),
    [regions, values.region]
  );

  const pgRegionLimitHelperText = `${MAXIMUM_NUMBER_OF_PLACEMENT_GROUPS_IN_REGION} ${getMaxPGsPerCustomer(
    selectedRegion
  )}`;

  const disabledRegions = regions?.reduce<Record<string, DisableItemOption>>(
    (acc, region) => {
      const isRegionAtCapacity = hasRegionReachedPlacementGroupCapacity({
        allPlacementGroups: allPlacementGroupsInRegion,
        region,
      });
      if (isRegionAtCapacity) {
        acc[region.id] = {
          reason: (
            <>
              <Typography>
                You’ve reached the limit of placement groups you can create in
                this region.
              </Typography>
              <Typography mt={2}>
                {MAXIMUM_NUMBER_OF_PLACEMENT_GROUPS_IN_REGION}{' '}
                {getMaxPGsPerCustomer(region)}
              </Typography>
            </>
          ),
          tooltipWidth: 300,
        };
      }
      return acc;
    },
    {}
  );

  return (
    <>
      {!isFromLinodeCreate && (
        <DocumentTitleSegment
          segment={`${open ? 'Create a Placement Group' : 'Placement Groups'}`}
        />
      )}
      <Drawer
        onClose={handleDrawerClose}
        open={open}
        title="Create Placement Group"
      >
        {disabledPlacementGroupCreateButton && (
          <Notice
            spacingTop={16}
            text={getRestrictedResourceText({
              action: 'edit',
              resourceType: 'Placement Groups',
            })}
            variant="error"
          />
        )}
        <form onSubmit={handleSubmit}>
          <Stack spacing={1}>
            {hasApiError && (
              <Notice variant="error">
                <List>
                  {error.map((e) => (
                    <ListItem
                      disablePadding={true}
                      key={e.field}
                      sx={{ my: 0.25 }}
                    >
                      - {e.reason}
                    </ListItem>
                  ))}
                </List>
              </Notice>
            )}
            {selectedRegion && isFromLinodeCreate && (
              <DescriptionList
                items={[
                  {
                    description: `${selectedRegion.label} (${selectedRegion.id})`,
                    title: 'Region',
                  },
                ]}
                sx={{ my: 2 }}
              />
            )}
            <Divider hidden={!selectedRegionId} />
            <TextField
              aria-label="Label for the Placement Group"
              disabled={disabledPlacementGroupCreateButton || false}
              errorText={errors.label}
              inputProps={{
                autoFocus: true,
              }}
              label="Label"
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />
            {!selectedRegionId && (
              <RegionSelect
                currentCapability="Placement Group"
                disableClearable
                disabled={
                  Boolean(selectedRegionId) ||
                  disabledPlacementGroupCreateButton
                }
                disabledRegions={disabledRegions}
                helperText={values.region && pgRegionLimitHelperText}
                isGeckoLAEnabled={isGeckoLAEnabled}
                onChange={(e, region) => handleRegionSelect(region.id)}
                regions={regions ?? []}
                tooltipText="Only regions that support placement groups are listed."
                value={selectedRegionId ?? values.region}
              />
            )}
            <PlacementGroupTypeSelect
              disabledPlacementGroupCreateButton={
                disabledPlacementGroupCreateButton
              }
              error={errors.placement_group_type}
              setFieldValue={setFieldValue}
            />
            <PlacementGroupPolicyRadioGroup
              disabledPlacementGroupCreateButton={
                disabledPlacementGroupCreateButton
              }
              handleChange={handleChange}
              setFieldValue={setFieldValue}
              value={values.placement_group_policy}
            />
            <ActionsPanel
              primaryButtonProps={{
                'data-testid': 'submit',
                disabled:
                  isSubmitting ||
                  !values.region ||
                  !values.label ||
                  disabledPlacementGroupCreateButton,
                label: 'Create Placement Group',
                loading: isSubmitting,
                onClick: () => setHasFormBeenSubmitted(true),
                type: 'submit',
              }}
              secondaryButtonProps={{
                'data-testid': 'cancel',
                label: 'Cancel',
                onClick: handleDrawerClose,
              }}
              sx={{ pt: 4 }}
            />
          </Stack>
        </form>
      </Drawer>
    </>
  );
};
