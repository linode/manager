import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { assocPath } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import Notice from 'src/components/Notice';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { filterImagesByType } from 'src/store/image/image.helpers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import { filterUDFErrors } from './formUtilities';
import {
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
  inner: {
    '& > div > div': {
      padding: 0
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

interface Props {
  request: (
    username: string,
    params?: any,
    filter?: any,
    stackScriptGrants?: Grant[]
  ) => Promise<ResourcePage<StackScript>>;
  header: string;
  category: 'community' | 'account';
}

const errorResources = {
  stackscript_id: 'The selected StackScript',
  image: 'image',
  region: 'region',
  type: 'A plan selection',
  label: 'A label',
  tags: 'Tags',
  root_pass: 'A root password'
};

export type CombinedProps = Props &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

export const FromStackScriptContent: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const {
    errors,
    header,
    imagesData,
    request,
    selectedImageID,
    selectedStackScriptID,
    selectedStackScriptUsername,
    selectedStackScriptLabel,
    updateImageID,
    userCannotCreateLinode,

    availableUserDefinedFields: userDefinedFields,
    availableStackScriptImages: compatibleImages,
    selectedUDFs: udf_data
  } = props;

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

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  return (
    <React.Fragment>
      <Grid
        data-qa-panel={header}
        item
        className={`${classes.main} mlMain py0`}
      >
        <div className={classes.inner}>
          <SelectStackScriptPanel
            data-qa-select-stackscript
            error={hasErrorFor('stackscript_id')}
            header={header}
            selectedId={selectedStackScriptID}
            selectedUsername={selectedStackScriptUsername}
            updateFor={[selectedStackScriptID, errors]}
            onSelect={handleSelectStackScript}
            publicImages={filterImagesByType(imagesData, 'public')}
            resetSelectedStackScript={() => null}
            disabled={userCannotCreateLinode}
            request={request}
            category={props.category}
          />
        </div>
        {!userCannotCreateLinode &&
          userDefinedFields &&
          userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              data-qa-udf-panel
              errors={filterUDFErrors(errorResources, props.errors)}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername={selectedStackScriptUsername || ''}
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
            data-qa-select-image-panel
            title="Select an Image"
            images={compatibleImages}
            handleSelectImage={updateImageID}
            selectedImageID={selectedImageID}
            error={hasErrorFor('image')}
            variant="public"
          />
        ) : (
          <Paper className={classes.emptyImagePanel}>
            {/* empty state for images */}
            {hasErrorFor('image') && (
              <Notice error={true} text={hasErrorFor('image')} />
            )}
            <Typography variant="h2" data-qa-tp="Select Image">
              Select Image
            </Typography>
            <Typography
              variant="body1"
              className={classes.emptyImagePanelText}
              data-qa-no-compatible-images
            >
              No Compatible Images Available
            </Typography>
          </Paper>
        )}
      </Grid>
      <StackScriptDrawer />
    </React.Fragment>
  );
};

export default FromStackScriptContent;
