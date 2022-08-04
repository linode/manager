import _, { curry } from 'lodash';
import { Image } from '@linode/api-v4/lib/images';
import { UserDefinedField } from '@linode/api-v4/lib/stackscripts';
import { assocPath } from 'ramda';
import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { compose } from 'recompose';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import setDocs, { SetDocsProps } from 'src/components/DocsSidebar/setDocs';
import Grid from 'src/components/Grid';
import ImageSelect from 'src/components/ImageSelect';
import { AppsDocs } from 'src/documentation';
import ImageEmptyState from 'src/features/linodes/LinodesCreate/TabbedContent/ImageEmptyState';
import { AppDetailDrawer } from 'src/features/OneClickApps';
import UserDefinedFieldsPanel from 'src/features/StackScripts/UserDefinedFieldsPanel';
import { ApplicationState } from 'src/store';
import getAPIErrorsFor from 'src/utilities/getAPIErrorFor';
import SelectAppPanel from '../SelectAppPanel';
import {
  AppsData,
  ReduxStateProps,
  StackScriptFormStateHandlers,
  WithTypesRegionsAndImages,
} from '../types';
import { filterUDFErrors } from './formUtilities';
import { APP_ROOT } from 'src/constants';
import DebouncedSearch from 'src/components/DebouncedSearchTextField';
import Select from 'src/components/EnhancedSelect';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';

type ClassNames = 'main' | 'sidebar' | 'searchAndFilter' | 'search' | 'filter';

const appCategories = [
  'Control Panels',
  'Databases',
  'Development',
  'Games',
  'Media and Entertainment',
  'Monitoring',
  'Productivity',
  'Security',
  'Stacks',
  'Website',
  'App Creators',
] as const;

const appCategoryOptions = appCategories.map((categoryName) => ({
  label: categoryName,
  value: categoryName,
}));

// type AppCategory = typeof appCategories;

const styles = (theme: Theme) =>
  createStyles({
    sidebar: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important',
      },
    },
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%',
      },
    },
    searchAndFilter: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: theme.spacing(),
    },
    search: {
      flexGrow: 10,
      '& .input': {
        maxWidth: 'none',
      },
    },
    filter: {
      flexGrow: 1,
    },
  });

const errorResources = {
  type: 'A plan selection',
  region: 'A region selection',
  label: 'A label',
  root_pass: 'A root password',
  image: 'Image',
  tags: 'Tags',
  stackscript_id: 'The selected App',
};

type InnerProps = AppsData &
  ReduxStateProps &
  StackScriptFormStateHandlers &
  WithTypesRegionsAndImages;

type CombinedProps = WithStyles<ClassNames> &
  InnerProps &
  StateProps &
  SetDocsProps;

interface State {
  detailDrawerOpen: boolean;
  selectedScriptForDrawer: string;
}

export const getCompatibleImages = (
  imagesData: Record<string, Image>,
  stackScriptImages: string[]
) =>
  _.compact(
    stackScriptImages.map((stackScriptImage) => imagesData[stackScriptImage])
  );

export const getDefaultUDFData = (userDefinedFields: UserDefinedField[]) => {
  return userDefinedFields.reduce((accum, eachField) => {
    if (eachField.default) {
      accum[eachField.name] = eachField.default;
    }
    return accum;
  }, {});
};

export const handleSelectStackScript = (
  id: number,
  label: string,
  username: string,
  stackScriptImages: string[],
  userDefinedFields: UserDefinedField[],
  imagesData: Record<string, Image>,
  updateStackScript: CombinedProps['updateStackScript']
) => {
  const compatibleImages = getCompatibleImages(imagesData, stackScriptImages);
  const defaultUDFData = getDefaultUDFData(userDefinedFields);
  updateStackScript(
    id,
    label,
    username,
    userDefinedFields,
    compatibleImages,
    defaultUDFData
  );
};

const curriedHandleSelectStackScript = curry(handleSelectStackScript);

class FromAppsContent extends React.PureComponent<CombinedProps, State> {
  state: State = {
    detailDrawerOpen: false,
    selectedScriptForDrawer: '',
  };

  //ramda's curry placehodler conflicts with lodash so the lodash curry and placeholder is used here
  handleSelectStackScript = curriedHandleSelectStackScript(
    curry.placeholder,
    curry.placeholder,
    curry.placeholder,
    curry.placeholder,
    curry.placeholder,
    this.props.imagesData,
    this.props.updateStackScript
  );

  handleChangeUDF = (key: string, value: string) => {
    // either overwrite or create new selection
    const newUDFData = assocPath([key], value, this.props.selectedUDFs);

    this.props.handleSelectUDFs({ ...this.props.selectedUDFs, ...newUDFData });
  };

  openDrawer = (stackScriptLabel: string) => {
    this.setState({
      detailDrawerOpen: true,
      selectedScriptForDrawer: stackScriptLabel,
    });
  };

  closeDrawer = () => {
    this.setState({
      detailDrawerOpen: false,
    });
  };

  render() {
    const {
      classes,
      selectedImageID,
      selectedStackScriptID,
      selectedStackScriptLabel,
      selectedUDFs: udf_data,
      availableUserDefinedFields: userDefinedFields,
      availableStackScriptImages: compatibleImages,
      updateImageID,
      errors,
      appInstances,
      appInstancesError,
      appInstancesLoading,
      userCannotCreateLinode,
    } = this.props;

    const logoUrl = appInstances?.find(
      (app) => app.id === selectedStackScriptID
    )?.logo_url;

    const renderLogo =
      logoUrl === undefined ? (
        <span className="fl-tux" />
      ) : (
        <img
          src={`${APP_ROOT}/${logoUrl}`}
          alt={`${selectedStackScriptLabel} logo`}
        />
      );

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain py0`}>
          <Box component={Paper} className={classes.searchAndFilter}>
            <Box className={classes.search}>
              <DebouncedSearch
                placeholder="Search marketplace"
                fullWidth
                onSearch={() => undefined}
                label="Search marketplace"
                hideLabel
              />
            </Box>
            <Box className={classes.filter}>
              <Select
                placeholder="Select category"
                options={appCategoryOptions}
                hideLabel
              />
            </Box>
          </Box>
          <SelectAppPanel
            appInstances={appInstances}
            appInstancesError={appInstancesError}
            appInstancesLoading={appInstancesLoading}
            selectedStackScriptID={selectedStackScriptID}
            disabled={userCannotCreateLinode}
            handleClick={this.handleSelectStackScript}
            openDrawer={this.openDrawer}
            error={hasErrorFor('stackscript_id')}
          />
          {!userCannotCreateLinode && userDefinedFields ? (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(errorResources, errors)}
              selectedLabel={selectedStackScriptLabel || ''}
              selectedUsername="Linode"
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[userDefinedFields, udf_data, errors]}
              udf_data={udf_data || {}}
              appLogo={renderLogo}
              openDrawer={this.openDrawer}
            />
          ) : null}
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
            <ImageEmptyState errorText={hasErrorFor('image')} />
          )}
        </Grid>

        <AppDetailDrawer
          open={this.state.detailDrawerOpen}
          stackScriptLabel={this.state.selectedScriptForDrawer}
          onClose={this.closeDrawer}
        />
      </React.Fragment>
    );
  }
}

const styled = withStyles(styles);

interface StateProps {
  documentation: Linode.Doc[];
}

const mapStateToProps: MapStateToProps<
  StateProps,
  CombinedProps,
  ApplicationState
> = (state) => ({
  documentation: state.documentation,
});

const connected = connect(mapStateToProps);

const generateDocs = (ownProps: InnerProps & StateProps) => {
  const { selectedStackScriptLabel } = ownProps;
  if (!!selectedStackScriptLabel) {
    const foundDocs = AppsDocs.filter((eachDoc) => {
      return eachDoc.title
        .toLowerCase()
        .includes(
          selectedStackScriptLabel
            .substr(0, selectedStackScriptLabel.indexOf(' '))
            .toLowerCase()
        );
    });
    return foundDocs.length ? foundDocs : [];
  }
  return [];
};

const updateCond = (
  prevProps: InnerProps & StateProps,
  nextProps: InnerProps & StateProps
) => {
  return prevProps.selectedStackScriptID !== nextProps.selectedStackScriptID;
};

export default compose<CombinedProps, InnerProps>(
  connected,
  setDocs(generateDocs, updateCond),
  styled
)(FromAppsContent);
