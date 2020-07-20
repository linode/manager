import * as React from 'react';
import { Link } from 'react-router-dom';
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
import Placeholder from 'src/components/Placeholder';
import { getErrorMap } from 'src/utilities/errorUtils';

import { filterImagesByType } from 'src/store/image/image.helpers';

import {
  BasicFromContentProps,
  ReduxStateProps,
  WithDisplayData,
  WithTypesRegionsAndImages
} from '../types';

type ClassNames = 'root' | 'main' | 'sidebarPrivate' | 'sidebarPublic';

const styles = (theme: Theme) =>
  createStyles({
    root: {},
    main: {
      [theme.breakpoints.up('md')]: {
        maxWidth: '100%'
      }
    },
    sidebarPrivate: {
      [theme.breakpoints.up('md')]: {
        marginTop: '-130px !important'
      }
    },
    sidebarPublic: {
      [theme.breakpoints.up('md')]: {
        marginTop: '0 !important'
      }
    }
  });

interface Props extends BasicFromContentProps {
  variant?: 'public' | 'private' | 'all';
  imagePanelTitle?: string;
  showGeneralError?: boolean;
}

const errorMap = [
  'backup_id',
  'linode_id',
  'stackscript_id',
  'region',
  'type',
  'root_pass',
  'label',
  'image'
];

export type CombinedProps = Props &
  WithStyles<ClassNames> &
  WithDisplayData &
  WithTypesRegionsAndImages &
  ReduxStateProps &
  BasicFromContentProps;

export class FromImageContent extends React.PureComponent<CombinedProps> {
  render() {
    const {
      classes,
      imagesData: images,
      userCannotCreateLinode,
      errors,
      imagePanelTitle,
      showGeneralError,
      variant
    } = this.props;

    const privateImages = filterImagesByType(images, 'private');

    if (variant === 'private' && Object.keys(privateImages).length === 0) {
      return (
        <Grid item className={`${classes.main} mlMain py0`}>
          <Paper>
            <Placeholder
              title="My Images"
              renderAsSecondary
              copy={
                <Typography variant="subtitle1">
                  You don&#39;t have any private Images. Visit the{' '}
                  <Link to="/images">Images section</Link> to create an Image
                  from one of your Linode&#39;s disks.
                </Typography>
              }
            />
          </Paper>
        </Grid>
      );
    }

    /**
     * subtab component handles displaying general errors internally, but the
     * issue here is that the FromImageContent isn't nested under
     * sub-tabs, so we need to display general errors here
     *
     * NOTE: This only applies to from Distro; "My Images" must be handled
     * separately.
     */
    const hasErrorFor = getErrorMap(errorMap, errors);

    return (
      <Grid item className={`${classes.main} mlMain py0`}>
        {hasErrorFor.none && !!showGeneralError && (
          <Notice error spacingTop={8} text={hasErrorFor.none} />
        )}
        <CreateLinodeDisabled isDisabled={userCannotCreateLinode} />
        <ImageSelect
          title={imagePanelTitle || 'Choose an Image'}
          images={Object.keys(images).map(eachKey => images[eachKey])}
          handleSelectImage={this.props.updateImageID}
          selectedImageID={this.props.selectedImageID}
          error={hasErrorFor.image}
          variant={variant}
          disabled={userCannotCreateLinode}
          data-qa-select-image-panel
        />
      </Grid>
    );
  }
}

const styled = withStyles(styles);

export default styled(FromImageContent);
