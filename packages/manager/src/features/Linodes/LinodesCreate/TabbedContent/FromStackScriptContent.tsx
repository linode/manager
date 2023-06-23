import { Image } from '@linode/api-v4/lib/images';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { assocPath, equals } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import { createStyles, withStyles, WithStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import ImageSelect from 'src/components/ImageSelect';
import ImageEmptyState from 'src/features/Linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDialog from 'src/features/StackScripts/StackScriptDialog';
import { StackScriptsRequest } from 'src/features/StackScripts/types';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { filterImagesByType } from 'src/store/image/image.helpers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import {
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages,
} from '../types';
import { filterUDFErrors } from './formUtilities';

type ClassNames = 'main' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles = (theme: Theme) =>
  createStyles({
    emptyImagePanel: {
      padding: theme.spacing(3),
    },
    emptyImagePanelText: {
      marginTop: theme.spacing(1),
      padding: `${theme.spacing(1)} 0`,
    },
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%',
      },
    },
  });

interface Props {
  request: StackScriptsRequest;
  header: string;
  category: 'community' | 'account';
}

const errorResources = {
  image: 'image',
  label: 'A label',
  region: 'region',
  root_pass: 'A root password',
  stackscript_id: 'The selected StackScript',
  tags: 'Tags',
  type: 'A plan selection',
};

type InnerProps = Props &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

export type CombinedProps = InnerProps & WithStyles<ClassNames>;

export class FromStackScriptContent extends React.PureComponent<CombinedProps> {
  handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => {
    const allowAllImages = stackScriptImages.includes('any/all');
    const { imagesData } = this.props;

    /**
     * based on the list of images we get back from the API, compare those
     * to our list of public images supported by Linode and filter out the ones
     * that aren't compatible with our selected StackScript
     */
    const compatibleImages = allowAllImages
      ? Object.values(imagesData)
      : Object.keys(imagesData).reduce((acc, eachKey) => {
          if (
            stackScriptImages.some((eachSSImage) => eachSSImage === eachKey)
          ) {
            acc.push(imagesData[eachKey]);
          }

          return acc;
        }, [] as Image[]);
    /**
     * if a UDF field comes back from the API with a "default"
     * value, it means we need to pre-populate the field and form state
     */
    const defaultUDFData = userDefinedFields.reduce((accum, eachField) => {
      if (eachField.default) {
        accum[eachField.name] = eachField.default;
      }
      return accum;
    }, {});

    this.props.updateStackScript(
      id,
      label,
      username,
      userDefinedFields,
      compatibleImages,
      defaultUDFData
    );
  };

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.props.selectedUDFs);

    this.props.handleSelectUDFs({ ...this.props.selectedUDFs, ...newUDFData });
  };

  render() {
    const {
      availableStackScriptImages: compatibleImages,
      availableUserDefinedFields: userDefinedFields,
      classes,
      errors,
      header,
      imagesData,
      request,
      selectedImageID,
      selectedStackScriptID,
      selectedStackScriptLabel,
      selectedStackScriptUsername,
      selectedUDFs: udf_data,
      updateImageID,
      userCannotCreateLinode,
    } = this.props;

    // If all of the StackScript's compatibleImages match the full array of images,
    // we can assume that the StackScript specified any/all
    const showAllImages = equals(compatibleImages, Object.values(imagesData));

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <Grid data-qa-panel={header} className={`${classes.main} mlMain py0`}>
          <SelectStackScriptPanel
            data-qa-select-stackscript
            error={hasErrorFor('stackscript_id')}
            header={header}
            selectedId={selectedStackScriptID}
            selectedUsername={selectedStackScriptUsername}
            updateFor={[selectedStackScriptID, errors]}
            onSelect={this.handleSelectStackScript}
            publicImages={filterImagesByType(imagesData, 'public')}
            resetSelectedStackScript={() => null}
            disabled={userCannotCreateLinode}
            request={request}
            category={this.props.category}
            isOnCreate
          />
          {!userCannotCreateLinode &&
            userDefinedFields &&
            userDefinedFields.length > 0 && (
              <UserDefinedFieldsPanel
                data-qa-udf-panel
                errors={filterUDFErrors(errorResources, this.props.errors)}
                selectedLabel={selectedStackScriptLabel || ''}
                selectedUsername={selectedStackScriptUsername || ''}
                handleChange={this.handleChangeUDF}
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
              variant={showAllImages ? 'all' : 'public'}
            />
          ) : (
            <ImageEmptyState
              className={classes.emptyImagePanel}
              errorText={hasErrorFor('image')}
            />
          )}
        </Grid>

        <StackScriptDialog />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default compose<CombinedProps, InnerProps>(styled)(
  FromStackScriptContent
);
