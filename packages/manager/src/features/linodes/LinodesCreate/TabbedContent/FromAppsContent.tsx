import { Image } from '@linode/api-v4/lib/images';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { assocPath } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Notice from 'src/components/Notice';
import { AppDetailDrawer } from 'src/features/OneClickApps';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { filterUDFErrors } from './formUtilities';
import SelectAppPanel from '../SelectAppPanel';
import {
  AppsData,
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages
} from '../types';

const useStyles = makeStyles((theme: Theme) => ({
  main: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '100%'
    }
  },
  emptyImagePanel: {
    padding: theme.spacing(3)
  },
  emptyImagePanelText: {
    marginTop: theme.spacing(1),
    padding: `${theme.spacing(1)}px 0`
  }
}));

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags',
  stackscript_id: 'The selected App'
};

type CombinedProps = AppsData &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

export const FromAppsContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    appInstances,
    appInstancesError,
    appInstancesLoading,
    errors,
    imagesData,
    userCannotCreateLinode,
    selectedImageID,
    selectedStackScriptID,
    selectedStackScriptLabel,
    selectedUDFs: udf_data,
    availableUserDefinedFields: userDefinedFields,
    availableStackScriptImages: compatibleImages,
    updateImageID
  } = props;

  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState<boolean>(
    false
  );
  const [selectedScriptForDrawer, setSelectedScriptForDrawer] = React.useState<
    string
  >('');

  const handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => {
    /**
     * Based on the list of images we get back from the API, compare those
     * to our list of master images supported by Linode and filter out the ones
     * that aren't compatible with our selected StackScript
     */
    const compatibleImages = Object.keys(imagesData).reduce((acc, eachKey) => {
      if (stackScriptImages.some(eachSSImage => eachSSImage === eachKey)) {
        acc.push(imagesData[eachKey]);
      }

      return acc;
    }, [] as Image[]);

    /**
     * If a UDF field comes back from the API with a "default"
     * value, it means we need to pre-populate the field and form state
     */
    const defaultUDFData = userDefinedFields.reduce((accum, eachField) => {
      if (eachField.default) {
        accum[eachField.name] = eachField.default;
      }
      return accum;
    }, {});

    props.updateStackScript(
      id,
      label,
      username,
      userDefinedFields,
      compatibleImages,
      defaultUDFData
    );
  };

  const handleChangeUDF = (key: string, value: string) => {
    // Either overwrite or create new selection
    const newUDFData = assocPath([key], value, props.selectedUDFs);
    props.handleSelectUDFs({ ...props.selectedUDFs, ...newUDFData });
  };

  const openDrawer = (stackScriptLabel: string) => {
    setDetailDrawerOpen(true);
    setSelectedScriptForDrawer(stackScriptLabel);
  };

  const closeDrawer = () => {
    setDetailDrawerOpen(false);
  };

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  return (
    <React.Fragment>
      <Grid item className={`${classes.main} mlMain py0`}>
        <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
        <SelectAppPanel
          appInstances={appInstances}
          appInstancesError={appInstancesError}
          appInstancesLoading={appInstancesLoading}
          selectedStackScriptID={selectedStackScriptID}
          disabled={userCannotCreateLinode}
          handleClick={handleSelectStackScript}
          openDrawer={openDrawer}
          error={hasErrorFor('stackscript_id')}
        />
        {!userCannotCreateLinode &&
          userDefinedFields &&
          userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(errorResources, errors)}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername="Linode"
              handleChange={handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data || {}}
            />
          )}
        {!userCannotCreateLinode &&
        compatibleImages &&
        compatibleImages.length > 0 ? (
          <ImageSelect
            title="Select an Image"
            images={compatibleImages}
            handleSelectImage={updateImageID}
            selectedImageID={selectedImageID}
            error={hasErrorFor('image')}
            variant="public"
          />
        ) : (
          <Paper className={classes.emptyImagePanel}>
            {/* Empty state for images */}
            {hasErrorFor('image') && (
              <Notice error={true} text={hasErrorFor('image')} />
            )}
            <Typography variant="h2" data-qa-tp="Select Image">
              Select Image
            </Typography>
            <Typography
              data-qa-no-compatible-images
              variant="body1"
              className={classes.emptyImagePanelText}
            >
              No Compatible Images Available
            </Typography>
          </Paper>
        )}
      </Grid>
      <AppDetailDrawer
        open={detailDrawerOpen}
        stackscriptID={selectedScriptForDrawer}
        onClose={closeDrawer}
      />
    </React.Fragment>
  );
};

export default FromAppsContent;
