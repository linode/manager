import { Image } from '@linode/api-v4/lib/images';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { assocPath } from 'ramda';
import * as React from 'react';

// State used for this hook
interface StackScriptState {
  id?: number;
  images: Image[];
  label: string;
  udf_data: any;
  user_defined_fields: UserDefinedField[];
  username: string;
}

// Function used by child components to handle StackScript selection
type HandleSelectStackScript = (
  id: number,
  label: string,
  username: string,
  stackScriptImages: string[],
  user_defined_fields: UserDefinedField[]
) => void;

// Function used by child components to handle changes in UDFs
type HandleChangeUDF = (key: string, value: string) => void;

// Function used to reset the StackScript state
type ResetStackScriptState = () => void;

// The return value of this hook
type UseStackScriptReturn = [
  StackScriptState,
  HandleSelectStackScript,
  HandleChangeUDF,
  ResetStackScriptState
];

/**
 * Provides state and methods used on forms/components that handle StackScripts.
 * @param {Image[]} images a list of all images, which are used to
 * filter compatible images for a StackScript
 * @returns {UseStackScriptReturn} [stackScript, handleSelectStackScript, handleChangeUDF, resetStackScript]
 */
export const useStackScript = (images: Image[]): UseStackScriptReturn => {
  const [stackScript, setStackScript] = React.useState<StackScriptState>(
    emptyStackScriptState
  );

  // Wrapper around setStackScript() – allows child components to handle selection of StackScript
  const handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    user_defined_fields: UserDefinedField[]
  ) => {
    setStackScript({
      id,
      images: getCompatibleImages(images, stackScriptImages),
      label,
      udf_data: getDefaultUDFData(user_defined_fields),
      user_defined_fields,
      username,
    });
  };

  // Wrapper around setStackScript() – allows child components to handle UDF data changes
  const handleChangeUDF = (key: string, value: string) => {
    setStackScript((prevState: any) => {
      // either overwrite or create new selection
      const newUDFData = assocPath([key], value, prevState.udf_data);
      return {
        ...prevState,
        udf_data: {
          ...prevState.udf_data,
          ...newUDFData,
        },
      };
    });
  };

  const resetStackScript = () => setStackScript(emptyStackScriptState);

  return [
    stackScript,
    handleSelectStackScript,
    handleChangeUDF,
    resetStackScript,
  ];
};

// =============================================================================
// HELPERS
// =============================================================================
const emptyStackScriptState: StackScriptState = {
  id: undefined,
  images: [],
  label: '',
  udf_data: [],
  user_defined_fields: [],
  username: '',
};

const getCompatibleImages = (
  allImages: Image[],
  stackScriptImages: string[]
) => {
  return allImages.filter((image) => stackScriptImages.includes(image.id));
};

const getDefaultUDFData = (userDefinedFields: UserDefinedField[]) => {
  const defaultUDFData = {};
  userDefinedFields.forEach((eachField) => {
    if (!!eachField.default) {
      defaultUDFData[eachField.name] = eachField.default;
    }
  });
  return defaultUDFData;
};
