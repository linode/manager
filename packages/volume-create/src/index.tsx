import {
  Box,
  Button,
  Notice,
  Paper,
  Stack,
  TextField,
  TooltipIcon,
  Typography,
} from "@linode/ui";
import { CreateVolumeSchema } from "@linode/validation/lib/volumes.schema";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "@tanstack/react-router";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import * as React from "react";
import { makeStyles } from "tss-react/mui";

import { LandingHeader } from "./components/LandingHeader";
import { RegionSelect } from "./components/RegionSelect/RegionSelect";
import { LinodeSelect } from "./features/Linodes/LinodeSelect/LinodeSelect";
import { useGrants, useProfile } from "./queries/profile/profile";
import { useRegionsQuery } from "./queries/regions/regions";
import {
  useCreateVolumeMutation,
  useVolumeTypesQuery,
} from "./queries/volumes/volumes";
import {
  handleFieldErrors,
  handleGeneralErrors,
} from "./utilities/formikErrorUtils";
import { isNilOrEmpty } from "./utilities/isNilOrEmpty";
import { maybeCastToNumber } from "./utilities/maybeCastToNumber";

import { ConfigSelect } from "./features/Volumes/VolumeDrawer/ConfigSelect";
import { SizeField } from "./features/Volumes/VolumeDrawer/SizeField";

import type { Linode } from "@linode/api-v4/lib/linodes/types";
import type { Theme } from "@mui/material/styles";

const useStyles = makeStyles()((theme: Theme) => {
  
  console.log("Got theme", theme)

  return {
  agreement: {
    maxWidth: "70%",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "unset",
    },
  },
  button: {
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      marginRight: theme.spacing(),
    },
  },
  buttonGroup: {
    marginTop: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      justifyContent: "flex-end",
    },
  },
  copy: {
    marginBottom: theme.spacing(),
    maxWidth: 700,
  },
  labelTooltip: {
    "& .MuiTooltip-tooltip": {
      minWidth: 220,
    },
  },
  linodeConfigSelectWrapper: {
    [theme.breakpoints.down("md")]: {
      alignItems: "flex-start",
      flexDirection: "column",
    },
  },
  linodeSelect: {
    marginRight: theme.spacing(4),
  },
  notice: {
    borderColor: "green",
    fontSize: 15,
    lineHeight: "18px",
  },
  select: {
    [theme.breakpoints.down("sm")]: {
      width: 320,
    },
    width: 400,
  },
  size: {
    position: "relative",
    width: 160,
  },
  tooltip: {
    "& .MuiTooltip-tooltip": {
      minWidth: 320,
    },
  },
}});

export const VolumeCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { classes } = useStyles();

  const { data: types, isError, isLoading } = useVolumeTypesQuery();

  const { data: profile } = useProfile();
  const { data: grants } = useGrants();

  const { data: regions } = useRegionsQuery();

  const { mutateAsync: createVolume } = useCreateVolumeMutation();

  const regionsWithBlockStorage =
    regions
      ?.filter((thisRegion) =>
        thisRegion.capabilities.includes("Block Storage"),
      )
      .map((thisRegion) => thisRegion.id) ?? [];

  const doesNotHavePermission =
    profile?.restricted && !grants?.global.add_volumes;

  const renderSelectTooltip = (tooltipText: string) => {
    return (
      <TooltipIcon
        sxTooltipIcon={{
          marginBottom: "6px",
          marginLeft: theme.spacing(),
          padding: 0,
        }}
        classes={{ popper: classes.tooltip }}
        status="help"
        text={tooltipText}
        tooltipPosition="right"
      />
    );
  };

  const { enqueueSnackbar } = useSnackbar();

  const {
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    isSubmitting,
    setFieldValue,
    status: error,
    touched,
    values,
  } = useFormik({
    initialValues,
    onSubmit: (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
      const { config_id, label, linode_id, region, size } = values;

      setSubmitting(true);

      /** Status holds our success and generalError messages. */
      setStatus(undefined);

      createVolume({
        config_id:
          config_id === null ? undefined : maybeCastToNumber(config_id),
        label,
        linode_id:
          linode_id === null ? undefined : maybeCastToNumber(linode_id),
        region: isNilOrEmpty(region) || region === "none" ? undefined : region,
        size: maybeCastToNumber(size),
      })
        .then((volume) => {
          resetForm({ values: initialValues });
          setSubmitting(false);
          enqueueSnackbar(`Volume scheduled for creation.`, {
            variant: "success",
          });
          navigate({
            params: {
              action: "details",
              volumeId: volume.id,
            },
            to: "/volumes/$volumeId/$action",
          });
        })
        .catch((errorResponse) => {
          setSubmitting(false);
          handleFieldErrors(setErrors, errorResponse);
          handleGeneralErrors(
            setStatus,
            errorResponse,
            `Unable to create a volume at this time. Please try again later.`,
          );
        });
    },
    validationSchema: CreateVolumeSchema,
  });

  const { config_id, linode_id } = values;

  const linodeError = touched.linode_id ? errors.linode_id : undefined;

  const isInvalidPrice = !types || isError;

  const disabled = Boolean(doesNotHavePermission || isInvalidPrice);

  const handleLinodeChange = (linode: Linode | null) => {
    if (linode !== null) {
      setFieldValue("linode_id", linode.id);
      setFieldValue("region", linode.region);
    } else {
      setFieldValue("linode_id", null);
      setFieldValue("config_id", null);
    }
  };

  return (
    <>
      <LandingHeader
        breadcrumbProps={{
          crumbOverrides: [
            {
              label: "Volumes",
              position: 1,
            },
          ],
          pathname: location.pathname,
        }}
        title="Create"
      />
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <Paper>
            <Typography
              className={classes.copy}
              data-qa-volume-size-help
              variant="body1"
            >
              <span>
                A single Volume can range from 10 to 16384 GB in size. Up to to
                eight Volumes can be attached to a single Linode. Select a
                region to see cost per GB.
              </span>
            </Typography>
            {error && (
              <Notice spacingBottom={0} spacingTop={12} variant="error">
                {error}
              </Notice>
            )}
            <TextField
              tooltipText="Use only ASCII letters, numbers,
                  underscores, and dashes."
              className={classes.select}
              data-qa-volume-label
              disabled={doesNotHavePermission}
              errorText={touched.label ? errors.label : undefined}
              label="Label"
              name="label"
              onBlur={handleBlur}
              onChange={handleChange}
              tooltipClasses={classes.labelTooltip}
              tooltipPosition="right"
              value={values.label}
            />
            <Box alignItems="flex-end" display="flex">
              <RegionSelect
                onChange={(e, region) => {
                  setFieldValue("region", region?.id ?? null);
                  setFieldValue("linode_id", null);
                }}
                currentCapability="Block Storage"
                disabled={doesNotHavePermission}
                errorText={touched.region ? errors.region : undefined}
                label="Region"
                onBlur={handleBlur}
                regions={regions ?? []}
                value={values.region}
                width={400}
              />
              {renderSelectTooltip(
                "Volumes must be created in a region. You can choose to create a Volume in a region and attach it later to a Linode in the same region.",
              )}
            </Box>
            <Box
              alignItems="baseline"
              className={classes.linodeConfigSelectWrapper}
              display="flex"
            >
              <Stack>
                <Box
                  alignItems="flex-end"
                  className={classes.linodeSelect}
                  display="flex"
                >
                  <LinodeSelect
                    optionsFilter={(linode: Linode) => {
                      const linodeRegion = linode.region;
                      const valuesRegion = values.region;

                      /** When values.region is empty, all Linodes with
                       * block storage support will be displayed, regardless
                       * of their region. However, if a region is selected,
                       * only Linodes from the chosen region with block storage
                       * support will be shown. */
                      return isNilOrEmpty(valuesRegion)
                        ? regionsWithBlockStorage.includes(linodeRegion)
                        : regionsWithBlockStorage.includes(linodeRegion) &&
                            linodeRegion === valuesRegion;
                    }}
                    sx={{
                      [theme.breakpoints.down("sm")]: {
                        width: 320,
                      },
                      width: "400px",
                    }}
                    clearable
                    disabled={doesNotHavePermission}
                    errorText={linodeError}
                    onBlur={handleBlur}
                    onSelectionChange={handleLinodeChange}
                    value={values.linode_id}
                  />
                  {renderSelectTooltip(
                    "If you select a Linode, the Volume will be automatically created in that Linode’s region and attached upon creation.",
                  )}
                </Box>
              </Stack>
              <ConfigSelect
                disabled={doesNotHavePermission || config_id === null}
                error={touched.config_id ? errors.config_id : undefined}
                linodeId={linode_id}
                name="configId"
                onBlur={handleBlur}
                onChange={(id: number) => setFieldValue("config_id", id)}
                value={config_id}
                width={320}
              />
            </Box>
            <Box alignItems="flex-end" display="flex" position="relative">
              <SizeField
                disabled={doesNotHavePermission}
                error={touched.size ? errors.size : undefined}
                hasSelectedRegion={!isNilOrEmpty(values.region)}
                name="size"
                onBlur={handleBlur}
                onChange={handleChange}
                regionId={values.region}
                textFieldStyles={classes.size}
                value={values.size}
              />
            </Box>
          </Paper>
          <Box display="flex" justifyContent="flex-end">
            <Button
              disabled={disabled}
              tooltipText={
                !isLoading && isInvalidPrice
                  ? "There was an error retrieving prices. Please reload and try again."
                  : ""
              }
              buttonType="primary"
              className={classes.button}
              data-qa-deploy-linode
              loading={isSubmitting}
              style={{ marginLeft: 12 }}
              type="submit"
            >
              Create Volume
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};

interface FormState {
  config_id: null | number;
  label: string;
  linode_id: null | number;
  region: string;
  size: number;
}

const initialValues: FormState = {
  config_id: null,
  label: "",
  linode_id: null,
  region: "",
  size: 20,
};

export default VolumeCreate;