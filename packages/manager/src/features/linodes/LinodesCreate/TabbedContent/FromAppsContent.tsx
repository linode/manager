import _, { curry } from 'lodash';
import { Image } from '@linode/api-v4/lib/images';
import { StackScript, UserDefinedField } from '@linode/api-v4/lib/stackscripts';
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
import Select, { Item } from 'src/components/EnhancedSelect';
import Box from 'src/components/core/Box';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import { oneClickApps, AppCategory } from 'src/features/OneClickApps/FakeSpec';
import { sendMarketplaceSearchEvent } from 'src/utilities/ga';

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
  //   'App Creators',
];

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
      marginTop: theme.spacing(),
      '& > h2': {
        width: '100%',
      },
    },
    search: {
      flexGrow: 10,
      '& .input': {
        maxWidth: 'none',
      },
    },
    filter: {
      flexGrow: 1.5,
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
  filteredApps: CombinedProps['appInstances'];
  isSearching: boolean;
  isFiltering: boolean;
  query: string;
  categoryFilter: Item<AppCategory> | null;
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

const renderLogo = (selectedStackScriptLabel?: string, logoUrl?: string) => {
  return logoUrl === undefined ? (
    <span className="fl-tux" />
  ) : (
    <img
      src={`${APP_ROOT}/${logoUrl.toLowerCase()}`}
      alt={`${selectedStackScriptLabel} logo`}
    />
  );
};

const curriedHandleSelectStackScript = curry(handleSelectStackScript);

const handleSearchFieldClick = () => {
  sendMarketplaceSearchEvent('Search Field');
};

class FromAppsContent extends React.Component<CombinedProps, State> {
  state: State = {
    detailDrawerOpen: false,
    selectedScriptForDrawer: '',
    filteredApps: [],
    isSearching: false,
    query: '',
    categoryFilter: null,
    isFiltering: false,
  };

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

  onSearch = (query: string) => {
    if (query === '') {
      this.setState({ isSearching: false });
    } else {
      const appsMatchingQuery = this.props.appInstances?.filter((app) =>
        app.label.toLowerCase().includes(query.toLowerCase())
      );
      this.setState({
        isFiltering: false,
        filteredApps: appsMatchingQuery,
        isSearching: true,
        categoryFilter: null,
        query: query,
      });
    }
  };

  handleSelectCategory = (categoryItem: Item<AppCategory>) => {
    const didUserSelectCategory = categoryItem !== null;
    let instancesInCategory: StackScript[] | undefined = [];
    if (didUserSelectCategory) {
      sendMarketplaceSearchEvent('Category Dropdown', categoryItem.label);
      const appsInCategory = oneClickApps.filter((oca) =>
        oca.categories?.includes(categoryItem.value)
      );
      const appLabels = appsInCategory.map((app) => app.name.trim());
      instancesInCategory = this.props.appInstances?.filter((instance) => {
        return appLabels.includes(instance.label.trim());
      });
    }
    this.setState({
      categoryFilter: categoryItem,
      isSearching: false,
      query: '',
      filteredApps: didUserSelectCategory ? instancesInCategory : [],
      isFiltering: didUserSelectCategory,
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

    //ramda's curry placehodler conflicts with lodash so the lodash curry and placeholder is used here
    const handleSelectStackScript = curriedHandleSelectStackScript(
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      curry.placeholder,
      this.props.imagesData,
      this.props.updateStackScript
    );

    const logoUrl = appInstances?.find(
      (app) => app.id === selectedStackScriptID
    )?.logo_url;

    const appLogo = renderLogo(selectedStackScriptLabel, logoUrl);

    const {
      filteredApps,
      isSearching,
      query,
      categoryFilter,
      isFiltering,
    } = this.state;

    const hasErrorFor = getAPIErrorsFor(errorResources, errors);

    return (
      <React.Fragment>
        <Grid item className={`${classes.main} mlMain py0`}>
          <Paper>
            <Typography variant="h2">Select an App</Typography>
            <Box className={classes.searchAndFilter}>
              <Box className={classes.search}>
                <DebouncedSearch
                  placeholder="Search for app name"
                  fullWidth
                  onSearch={this.onSearch}
                  label="Search marketplace"
                  onClick={handleSearchFieldClick}
                  hideLabel
                  value={query}
                />
              </Box>
              <Box className={classes.filter}>
                <Select
                  placeholder="Select category"
                  options={appCategoryOptions}
                  onChange={this.handleSelectCategory}
                  value={categoryFilter}
                  hideLabel
                />
              </Box>
            </Box>
          </Paper>
          <SelectAppPanel
            appInstances={
              isSearching || isFiltering ? filteredApps : appInstances
            }
            appInstancesError={appInstancesError}
            appInstancesLoading={appInstancesLoading}
            selectedStackScriptID={selectedStackScriptID}
            disabled={userCannotCreateLinode}
            handleClick={handleSelectStackScript}
            openDrawer={this.openDrawer}
            error={hasErrorFor('stackscript_id')}
            isSearching={isSearching}
            isFiltering={isFiltering}
          />
          {!userCannotCreateLinode && selectedStackScriptLabel ? (
            <UserDefinedFieldsPanel
              errors={filterUDFErrors(errorResources, errors)}
              selectedLabel={selectedStackScriptLabel}
              selectedUsername="Linode"
              handleChange={this.handleChangeUDF}
              userDefinedFields={userDefinedFields}
              updateFor={[
                selectedStackScriptID,
                userDefinedFields,
                udf_data,
                errors,
              ]}
              udf_data={udf_data || {}}
              appLogo={appLogo}
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
