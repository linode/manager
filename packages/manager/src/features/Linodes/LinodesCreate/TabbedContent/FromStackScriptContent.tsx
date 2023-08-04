import { Image } from '@linode/api-v4/lib/images';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { styled } from '@mui/material/styles';
import { StyledGrid } from './CommonTabbedContent.styles';
import { assocPath, equals } from 'ramda';
import * as React from 'react';

import ImageSelect from 'src/components/ImageSelect';
import { ImageEmptyState } from 'src/features/Linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDialog from 'src/features/StackScripts/StackScriptDialog';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { StackScriptsRequest } from 'src/features/StackScripts/types';
import { filterImagesByType } from 'src/store/image/image.helpers';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import {
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages,
} from '../types';
import { filterUDFErrors } from './formUtilities';

interface Props {
  category: 'account' | 'community';
  header: string;
  request: StackScriptsRequest;
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

export type CombinedProps = Props &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

export const FromStackScriptContent = React.memo((props: CombinedProps) => {
  const {
    availableStackScriptImages: compatibleImages,
    availableUserDefinedFields: userDefinedFields,
    category,
    errors,
    handleSelectUDFs,
    header,
    imagesData,
    request,
    selectedImageID,
    selectedStackScriptID,
    selectedStackScriptLabel,
    selectedStackScriptUsername,
    selectedUDFs: udf_data,
    updateImageID,
    updateStackScript,
    userCannotCreateLinode,
  } = props;

  const showAllImages = equals(compatibleImages, Object.values(imagesData));

  const hasErrorFor = getAPIErrorsFor(errorResources, errors);

  const handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, udf_data);

    handleSelectUDFs({ ...udf_data, ...newUDFData });
  };

  const handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => {
    const allowAllImages = stackScriptImages.includes('any/all');

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

    updateStackScript(
      id,
      label,
      username,
      userDefinedFields,
      compatibleImages,
      defaultUDFData
    );
  };

  return (
    <React.Fragment>
      <StyledGrid data-qa-panel={header}>
        <SelectStackScriptPanel
          category={category}
          data-qa-select-stackscript
          disabled={userCannotCreateLinode}
          error={hasErrorFor('stackscript_id')}
          header={header}
          isOnCreate
          onSelect={handleSelectStackScript}
          publicImages={filterImagesByType(imagesData, 'public')}
          request={request}
          resetSelectedStackScript={() => null}
          selectedId={selectedStackScriptID}
          selectedUsername={selectedStackScriptUsername}
          updateFor={[selectedStackScriptID, errors]}
        />
        {!userCannotCreateLinode &&
          userDefinedFields &&
          userDefinedFields.length > 0 && (
            <UserDefinedFieldsPanel
              data-qa-udf-panel
              errors={filterUDFErrors(errorResources, errors)}
              handleChange={handleChangeUDF}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername={selectedStackScriptUsername || ''}
              udf_data={udf_data || {}}
              updateFor={[userDefinedFields, udf_data, errors]}
              userDefinedFields={userDefinedFields}
            />
          )}
        {!userCannotCreateLinode &&
        compatibleImages &&
        compatibleImages.length > 0 ? (
          <ImageSelect
            data-qa-select-image-panel
            error={hasErrorFor('image')}
            handleSelectImage={updateImageID}
            images={compatibleImages}
            selectedImageID={selectedImageID}
            title="Select an Image"
            variant={showAllImages ? 'all' : 'public'}
          />
        ) : (
          <StyledImageEmptyState errorText={hasErrorFor('image')} />
        )}
      </StyledGrid>

      <StackScriptDialog />
    </React.Fragment>
  );
});

const StyledImageEmptyState = styled(ImageEmptyState, {
  label: 'StyledImageEmptyState',
})(({ theme }) => ({
  padding: theme.spacing(3),
}));
