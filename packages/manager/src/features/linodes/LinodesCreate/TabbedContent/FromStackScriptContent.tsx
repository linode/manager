import { Grant } from '@linode/api-v4/lib/account';
import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { ResourcePage } from '@linode/api-v4/lib/types';
import { assocPath } from 'ramda';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import CreateLinodeDisabled from 'src/components/CreateLinodeDisabled';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';

import Notice from 'src/components/Notice';

import { Tag } from 'src/components/TagsInput';
import SelectStackScriptPanel from 'src/features/StackScripts/SelectStackScriptPanel/SelectStackScriptPanel';
import StackScriptDrawer from 'src/features/StackScripts/StackScriptDrawer';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';

import { filterUDFErrors } from './formUtilities';
import { renderBackupsDisplaySection } from './utils';

import { filterImagesByType } from 'src/store/image/image.helpers';

import {
  ReduxStatePropsAndSSHKeys,
  StackScriptFormStateHandlers,
  WithDisplayData,
  WithTypesRegionsAndImages
} from '../types';

type ClassNames =
  | 'main'
  | 'sidebar'
  | 'emptyImagePanel'
  | 'emptyImagePanelText';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    main: {
      // @todo: hacky way to access the SelectStackScriptPanel component
      '& form > div > div': {
        padding: 0
      },
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%'
      }
    },
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important'
      }
    },
    emptyImagePanel: {
      padding: theme.spacing(3)
    },
    emptyImagePanelText: {
      marginTop: theme.spacing(1),
      padding: `${theme.spacing(1)}px 0`
    }
  });

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
  type: 'A plan selection',
  region: 'region',
  label: 'A label',
  root_pass: 'A root password',
  image: 'image',
  tags: 'Tags',
  stackscript_id: 'The selected StackScript'
};

export type CombinedProps = Props &
  StackScriptFormStateHandlers &
  ReduxStatePropsAndSSHKeys &
  WithTypesRegionsAndImages &
  WithDisplayData &
  WithStyles<ClassNames>;

export class FromStackScriptContent extends React.PureComponent<CombinedProps> {
  handleSelectStackScript = (
    id: number,
    label: string,
    username: string,
    stackScriptImages: string[],
    userDefinedFields: UserDefinedField[]
  ) => {
    const { imagesData } = this.props;
    /**
     * based on the list of images we get back from the API, compare those
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

  // handleCreateLinode = () => {
  //   const {
  //     backupsEnabled,
  //     password,
  //     privateIPEnabled,
  //     userSSHKeys,
  //     handleSubmitForm,
  //     selectedImageID,
  //     selectedRegionID,
  //     selectedStackScriptID,
  //     selectedTypeID,
  //     selectedUDFs,
  //     tags
  //   } = this.props;

  //   handleSubmitForm({
  //     region: selectedRegionID,
  //     type: selectedTypeID,
  //     stackscript_id: selectedStackScriptID,
  //     stackscript_data: selectedUDFs,
  //     label: this.props.label /* optional */,
  //     root_pass: password /* required if image ID is provided */,
  //     image: selectedImageID /* optional */,
  //     backups_enabled: backupsEnabled /* optional */,
  //     booted: true,
  //     private_ip: privateIPEnabled,
  //     authorized_users: userSSHKeys
  //       .filter(u => u.selected)
  //       .map(u => u.username),
  //     tags: tags ? tags.map((item: Tag) => item.value) : []
  //   });
  // };

  render() {
    const {
      accountBackupsEnabled,
      errors,
      backupsMonthlyPrice,

      classes,
      imageDisplayInfo,
      regionDisplayInfo,
      selectedImageID,

      selectedStackScriptID,

      typeDisplayInfo,

      backupsEnabled,
      imagesData,
      userCannotCreateLinode: disabled,
      selectedStackScriptUsername,
      selectedStackScriptLabel,
      label,
      request,
      header,
      updateImageID,

      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: compatibleImages,
      selectedUDFs: udf_data
    } = this.props;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    const hasBackups = Boolean(backupsEnabled || accountBackupsEnabled);

    const determineIDName =
      this.props.category === 'community'
        ? 'community-stackscript-create'
        : 'account-stackscript-create';

    const displaySections = [];

    if (selectedStackScriptUsername && selectedStackScriptLabel) {
      displaySections.push({
        title: selectedStackScriptUsername + ' / ' + selectedStackScriptLabel
      });
    }

    if (imageDisplayInfo) {
      displaySections.push(imageDisplayInfo);
    }

    if (regionDisplayInfo) {
      displaySections.push({
        title: regionDisplayInfo.title,
        details: regionDisplayInfo.details
      });
    }

    if (typeDisplayInfo) {
      displaySections.push(typeDisplayInfo);
    }

    if (label) {
      displaySections.push({
        title: 'Linode Label',
        details: label
      });
    }

    if (hasBackups && typeDisplayInfo && backupsMonthlyPrice) {
      displaySections.push(
        renderBackupsDisplaySection(accountBackupsEnabled, backupsMonthlyPrice)
      );
    }

    return (
      <React.Fragment>
        <Grid
          data-qa-panel={header}
          item
          className={`${classes.main} mlMain py0`}
          role="tabpanel"
          id={`tabpanel-${determineIDName}`}
          aria-labelledby={`tab-${determineIDName}`}
        >
          <form>
            <CreateLinodeDisabled isDisabled={disabled} />
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
              disabled={disabled}
              request={request}
              category={this.props.category}
            />
            {!disabled && userDefinedFields && userDefinedFields.length > 0 && (
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
            {!disabled && compatibleImages && compatibleImages.length > 0 ? (
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
          </form>
        </Grid>
        <StackScriptDrawer />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromStackScriptContent);
