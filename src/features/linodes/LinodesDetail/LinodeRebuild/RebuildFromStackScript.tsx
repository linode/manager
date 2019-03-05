import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { assocPath } from 'ramda';
import * as React from 'react';
import { compose } from 'recompose';
import AccessPanel from 'src/components/AccessPanel';
import ActionsPanel from 'src/components/ActionsPanel';
import Button from 'src/components/Button';
import Paper from 'src/components/core/Paper';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import Notice from 'src/components/Notice';
import SelectRegionPanel, {
  ExtendedRegion
} from 'src/components/SelectRegionPanel';
import { dcDisplayNames } from 'src/constants';
import regionsContainer from 'src/containers/regions.container';
import withImages from 'src/containers/withImages.container';
import { resetEventsPolling } from 'src/events';
import SelectImagePanel from 'src/features/linodes/LinodesCreate/SelectImagePanel';
import userSSHKeyHoc, {
  UserSSHKeyProps
} from 'src/features/linodes/userSSHKeyHoc';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { rebuildLinode } from 'src/services/linodes';
import { getAPIErrorOrDefault, getErrorMap } from 'src/utilities/errorUtils';
import { filterPublicImages } from 'src/utilities/images';
import scrollErrorIntoView from 'src/utilities/scrollErrorIntoView';
import { withLinodeDetailContext } from '../linodeDetailContext';

type ClassNames = 'root' | 'error' | 'emptyImagePanel' | 'emptyImagePanelText';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    paddingTop: theme.spacing.unit * 3
  },
  error: {
    marginTop: theme.spacing.unit * 2
  },
  emptyImagePanel: {
    padding: theme.spacing.unit * 3
  },
  emptyImagePanelText: {
    marginTop: theme.spacing.unit,
    padding: `${theme.spacing.unit}px 0`
  }
});

interface ContextProps {
  linodeId: number;
}
interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
  imagesError?: string;
}

export type CombinedProps = WithStyles<ClassNames> &
  WithImagesProps &
  WithRegions &
  ContextProps &
  UserSSHKeyProps &
  InjectedNotistackProps;

export const RebuildFromStackScript: React.StatelessComponent<
  CombinedProps
> = props => {
  const {
    classes,
    imagesData,
    userSSHKeys,
    regionsData,
    linodeId,
    enqueueSnackbar
  } = props;

  const [stackScript, setStackScript] = React.useState<any>({});
  const [selectedImage, setSelectedImage] = React.useState<string>('');
  const [selectedRegionID, setSelectedRegionID] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [errors, setErrors] = React.useState<Linode.ApiFieldError[]>([]);

  const {
    selectedStackScriptID,
    selectedStackScriptUsername,
    selectedStackScriptLabel,
    compatibleImages,
    userDefinedFields,
    udf_data
  } = stackScript;

  const handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: Linode.StackScript.UserDefinedField[]
  ) => {
    setStackScript({
      selectedStackScriptID: id,
      selectedStackScriptUsername: username,
      selectedStackScriptLabel: label,
      compatibleImages: getCompatibleImages(imagesData, stackScriptImages),
      userDefinedFields,
      udf_data: getDefaultUDFData(userDefinedFields)
    });
    setErrors([]);
  };

  function handleChangeUDF(key: string, value: string) {
    setStackScript((prevState: any) => {
      // either overwrite or create new selection
      const newUDFData = assocPath([key], value, prevState.udf_data);
      return {
        ...prevState,
        udf_data: {
          ...prevState.udf_data,
          ...newUDFData
        }
      };
    });
  }

  const handleSubmit = () => {
    rebuildLinode(linodeId, {
      stackscript_id: selectedStackScriptID,
      stackscript_data: udf_data,
      root_pass: password,
      image: selectedImage,
      authorized_users: userSSHKeys.filter(u => u.selected).map(u => u.username)
    })
      .then(_ => {
        resetEventsPolling();

        setPassword('');
        setErrors([]);

        enqueueSnackbar('Linode rebuild started', {
          variant: 'info'
        });
      })
      .catch(errorResponse => {
        setErrors(
          getAPIErrorOrDefault(
            errorResponse,
            'There was an issue rebuilding your Linode.'
          )
        );
        scrollErrorIntoView();
      });
  };

  const fixedErrors = ['root_pass', 'image', 'region', 'none'];

  const hasErrorFor = getErrorMap(
    [
      ...fixedErrors,
      ...(userDefinedFields || []).map(
        (udf: Linode.StackScript.UserDefinedField) => udf.name
      )
    ],
    errors
  );
  const generalError = hasErrorFor.none;
  const udfErrors = getUDFErrors(fixedErrors, errors);

  return (
    <Grid item className={classes.root}>
      {generalError && (
        <Notice
          error
          className={classes.error}
          text={generalError}
          data-qa-notice
        />
      )}
      <SelectStackScriptPanel
        error={hasErrorFor['stackscript_id']}
        selectedId={selectedStackScriptID}
        selectedUsername={selectedStackScriptUsername}
        updateFor={[selectedStackScriptID, errors]}
        onSelect={handleSelectStackScript}
        publicImages={filterPublicImages(imagesData)}
        resetSelectedStackScript={() => setStackScript({})}
      />
      {userDefinedFields && userDefinedFields.length > 0 && (
        <UserDefinedFieldsPanel
          errors={udfErrors}
          selectedLabel={selectedStackScriptLabel}
          selectedUsername={selectedStackScriptUsername}
          handleChange={handleChangeUDF}
          userDefinedFields={userDefinedFields}
          updateFor={[userDefinedFields, udf_data, errors]}
          udf_data={udf_data}
        />
      )}
      {compatibleImages && compatibleImages.length > 0 ? (
        <SelectImagePanel
          images={compatibleImages}
          handleSelection={(selected: string) => setSelectedImage(selected)}
          updateFor={[selectedImage, compatibleImages, errors]}
          selectedImageID={selectedImage}
          error={hasErrorFor.image}
          hideMyImages={true}
        />
      ) : (
        <Paper className={classes.emptyImagePanel}>
          {/* empty state for images */}
          {hasErrorFor.image && (
            <Notice error={true} text={hasErrorFor.image} />
          )}
          <Typography role="header" variant="h2" data-qa-tp="Select Image">
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
      <SelectRegionPanel
        error={hasErrorFor.region}
        regions={regionsData}
        handleSelection={(selected: string) => setSelectedRegionID(selected)}
        selectedID={selectedRegionID}
        updateFor={[selectedRegionID, errors]}
        copy="Determine the best location for your Linode."
      />
      <AccessPanel
        password={password}
        handleChange={value => setPassword(value)}
        updateFor={[password, errors, userSSHKeys, selectedStackScriptID]}
        error={hasErrorFor.root_pass}
        users={userSSHKeys}
        data-qa-access-panel
      />
      <ActionsPanel>
        <Button
          type="secondary"
          className="destructive"
          onClick={handleSubmit}
          data-qa-rebuild
        >
          Rebuild
        </Button>
      </ActionsPanel>
    </Grid>
  );
};

const styled = withStyles(styles);

const linodeContext = withLinodeDetailContext(({ linode }) => ({
  linodeId: linode.id
}));

interface WithRegions {
  regionsData: ExtendedRegion[];
  regionsLoading: boolean;
  regionsError: Linode.ApiFieldError[];
}

const withRegions = regionsContainer(({ data, loading, error }) => ({
  regionsData: data
    .filter(region => region.id !== 'ap-northeast-1a')
    .map(r => ({ ...r, display: dcDisplayNames[r.id] })),
  regionsLoading: loading,
  regionsError: error
}));

const enhanced = compose<CombinedProps, {}>(
  linodeContext,
  userSSHKeyHoc,
  styled,
  withSnackbar,
  withRegions,
  withImages((ownProps, imagesData, imagesLoading, imagesError) => ({
    ...ownProps,
    imagesData,
    imagesLoading,
    imagesError
  }))
);

export default enhanced(RebuildFromStackScript);

// =============================================================================
// Helpers
// =============================================================================
const getCompatibleImages = (
  allImages: Linode.Image[],
  stackScriptImages: string[]
) => {
  return allImages.filter(image => {
    for (const stackScriptImage of stackScriptImages) {
      if (image.id === stackScriptImage) {
        return true;
      }
    }
    return false;
  });
};

const getDefaultUDFData = (
  userDefinedFields: Linode.StackScript.UserDefinedField[]
) => {
  const defaultUDFData = {};
  userDefinedFields.forEach(eachField => {
    if (!!eachField.default) {
      defaultUDFData[eachField.name] = eachField.default;
    }
  });
  return defaultUDFData;
};

const getUDFErrors = (
  errorTypes: string[],
  errors: Linode.ApiFieldError[] | undefined
) => {
  return errors
    ? errors.filter(error => {
        // ensure the error isn't a root_pass, image, region, type, label
        const isNotUDFError = errorTypes.some(errorKey => {
          return errorKey === error.field;
        });
        // if the 'field' prop exists and isn't any other error
        return !!error.field && !isNotUDFError;
      })
    : undefined;
};
