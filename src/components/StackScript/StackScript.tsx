import { WithStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { compose } from 'recompose';
import Chip from 'src/components/core/Chip';
import Divider from 'src/components/core/Divider';
import { createStyles, Theme, withStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExternalLink from 'src/components/ExternalLink';
import ScriptCode from 'src/components/ScriptCode';
import withImages from 'src/containers/withImages.container';

type CSSClasses =
  | 'root'
  | 'deployments'
  | 'author'
  | 'description'
  | 'scriptHeading'
  | 'descriptionText'
  | 'deploymentSection'
  | 'dateTimeDisplay'
  | 'compatibleImages'
  | 'divider';

const styles: StyleRulesCallback<CSSClasses> = theme => {
  return {
    root: {
      backgroundColor: theme.color.white,
      '.detailsWrapper &': {
        padding: theme.spacing(4)
      }
    },
    deployments: {
      marginTop: theme.spacing(1)
    },
    author: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    },
    description: {
      whiteSpace: 'pre-wrap'
    },
    scriptHeading: {
      marginBottom: theme.spacing(1),
      fontSize: '1rem'
    },
    descriptionText: {
      marginBottom: theme.spacing(2)
    },
    deploymentSection: {
      marginTop: theme.spacing(1),
      fontSize: '1rem'
    },
    dateTimeDisplay: {
      display: 'inline-block',
      fontSize: '1rem'
    },
    compatibleImages: {
      display: 'block',
      marginTop: theme.spacing(1)
    },
    divider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  };
};

export interface Props {
  data: Linode.StackScript.Response;
}

export interface State {
  imagesList: Linode.Image[];
}

type CombinedProps = Props & WithImagesProps & WithStyles<CSSClasses>;

export class StackScript extends React.Component<CombinedProps> {
  render() {
    const {
      classes,
      data: {
        username,
        deployments_total,
        deployments_active,
        description,
        script,
        label,
        updated,
        images
      },
      imagesData
    } = this.props;

    const compatibleImages =
      images.reduce((acc: any[], image: string) => {
        const imageObj = imagesData.find(i => i.id === image);

        if (imageObj) {
          acc.push(
            <Chip
              key={imageObj.id}
              label={imageObj.label}
              component="span"
              clickable={false}
            />
          );
        }

        return acc;
      }, []) || 'No compatible images found';

    return (
      <div className={classes.root}>
        <Typography variant="h1" component="h2" data-qa-stack-title={label}>
          {label}
        </Typography>
        <Typography
          variant="h3"
          className={classes.author}
          data-qa-stack-author={username}
        >
          by&nbsp;
          <ExternalLink
            text={username}
            link={`https://www.linode.com/stackscripts/profile/${username}`}
            data-qa-community-stack-link
          />
        </Typography>
        <div data-qa-stack-deployments className={classes.deployments}>
          <Typography className={classes.deploymentSection}>
            <strong>{deployments_total}</strong> deployments
          </Typography>
          <Typography className={classes.deploymentSection}>
            <strong>{deployments_active}</strong> still active
          </Typography>
          <Typography className={classes.deploymentSection}>
            <strong>Last revision: </strong>
            <DateTimeDisplay
              value={updated}
              humanizeCutoff={'month'}
              className={classes.dateTimeDisplay}
            />
          </Typography>
          <Divider className={classes.divider} />
        </div>
        {description && (
          <div className={classes.description}>
            <Typography
              className={classes.descriptionText}
              data-qa-stack-description
            >
              {description}
            </Typography>
            <Divider className={classes.divider} />
          </div>
        )}
        <div>
          <Typography
            data-qa-compatible-distro
            className={classes.deploymentSection}
            style={{ marginTop: 0 }}
          >
            <strong>Compatible with:</strong>
            <span className={classes.compatibleImages}>{compatibleImages}</span>
          </Typography>
          <Divider className={classes.divider} />
        </div>
        <Typography className={classes.scriptHeading}>
          <strong>Script:</strong>
        </Typography>
        <ScriptCode script={script} />
      </div>
    );
  }
}

const styled = withStyles(styles);

interface WithImagesProps {
  imagesData: Linode.Image[];
  imagesLoading: boolean;
}

const enhanced = compose<CombinedProps, Props>(
  styled,
  withImages((ownProps, imagesData, imagesLoading) => ({
    ...ownProps,
    imagesData: imagesData.filter(i => i.is_public === true),
    imagesLoading
  }))
);
export default enhanced(StackScript);
