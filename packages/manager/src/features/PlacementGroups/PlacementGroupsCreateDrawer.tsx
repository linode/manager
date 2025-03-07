import {
  Divider,
  List,
  ListItem,
  Notice,
  Stack,
  TextField,
  Typography,
} from '@linode/ui';
import { getQueryParamsFromQueryString } from '@linode/utilities';
import { createPlacementGroupSchema } from '@linode/validation';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import * as React from 'react';
// eslint-disable-next-line no-restricted-imports
import { useLocation } from 'react-router-dom';

import { ActionsPanel } from 'src/components/ActionsPanel/ActionsPanel';
import { DescriptionList } from 'src/components/DescriptionList/DescriptionList';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { Drawer } from 'src/components/Drawer';
import { RegionSelect } from 'src/components/RegionSelect/RegionSelect';
import { getRestrictedResourceText } from 'src/features/Account/utils';
import { useFormValidateOnChange } from 'src/hooks/useFormValidateOnChange';
import {
  useAllPlacementGroupsQuery,
  useCreatePlacementGroup,
} from 'src/queries/placementGroups';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { sendLinodeCreateFormStepEvent } from 'src/utilities/analytics/formEventAnalytics';
import { getFormikErrorsFromAPIErrors } from 'src/utilities/formikErrorUtils';
import { scrollErrorIntoView } from 'src/utilities/scrollErrorIntoView';

import { MAXIMUM_NUMBER_OF_PLACEMENT_GROUPS_IN_REGION } from './constants';
import { PlacementGroupPolicyRadioGroup } from './PlacementGroupPolicyRadioGroup';
import { PlacementGroupTypeSelect } from './PlacementGroupTypeSelect';
import {
  getMaxPGsPerCustomer,
  hasRegionReachedPlacementGroupCapacity,
} from './utils';

import type { LinodeCreateType } from '../Linodes/LinodeCreate/types';
import type { PlacementGroupsCreateDrawerProps } from './types';
import type {
  CreatePlacementGroupPayload,
  PlacementGroup,
  Region,
} from '@linode/api-v4';
import type { FormikHelpers } from 'formik';
import type { DisableItemOption } from 'src/components/ListItemOption';

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
  const { data: regions } = useRegionsQuery();
  const { data: allPlacementGroupsInRegion } = useAllPlacementGroupsQuery({
    enabled: Boolean(selectedRegionId),
    filter: {
      region: selectedRegionId,
    },
  });
  const { error, mutateAsync } = useCreatePlacementGroup();
  const { enqueueSnackbar } = useSnackbar();
  const {
    hasFormBeenSubmitted,
    setHasFormBeenSubmitted,
  } = useFormValidateOnChange();

  const location = useLocation();
  const isFromLinodeCreate = location.pathname.includes('/linodes/create');
  const queryParams = getQueryParamsFromQueryString(location.search);

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
            createType: (queryParams.type as LinodeCreateType) ?? 'OS',
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
      placement_group_policy: 'strict' as PlacementGroup['placement_group_policy'],
      placement_group_type: 'anti_affinity:local' as PlacementGroup['placement_group_type'],
      region: selectedRegionId ?? '',
    },
    onSubmit: handleFormSubmit,
    validateOnBlur: false,
    validateOnChange: hasFormBeenSubmitted,
    validationSchema: createPlacementGroupSchema,
  });

  const hasApiError = error?.[0]?.reason;

  const selectedRegion = React.useMemo(
    () => regions?.find((region) => region.id == values.region),
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
            text={getRestrictedResourceText({
              action: 'edit',
              resourceType: 'Placement Groups',
            })}
            spacingTop={16}
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
              inputProps={{
                autoFocus: true,
              }}
              aria-label="Label for the Placement Group"
              disabled={disabledPlacementGroupCreateButton || false}
              errorText={errors.label}
              label="Label"
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values.label}
            />
            {!selectedRegionId && (
              <RegionSelect
                disabled={
                  Boolean(selectedRegionId) ||
                  disabledPlacementGroupCreateButton
                }
                currentCapability="Placement Group"
                disableClearable
                disabledRegions={disabledRegions}
                helperText={values.region && pgRegionLimitHelperText}
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
