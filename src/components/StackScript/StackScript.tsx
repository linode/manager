import * as React from 'react';
import { compose } from 'recompose';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
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
  | 'descriptionText';

const styles: StyleRulesCallback<CSSClasses> = theme => {
  return {
    root: {
      backgroundColor: theme.color.white,
      '.detailsWrapper &': {
        padding: theme.spacing.unit * 4
      }
    },
    deployments: {},
    author: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2
    },
    description: {
      marginTop: theme.spacing.unit * 4,
      marginBottom: theme.spacing.unit * 4,
      paddingTop: theme.spacing.unit * 4,
      paddingBottom: theme.spacing.unit * 4,
      whiteSpace: 'pre-wrap',
      borderTop: `1px solid ${theme.color.grey2}`,
      borderBottom: `1px solid ${theme.color.grey2}`
    },
    scriptHeading: {
      marginBottom: theme.spacing.unit
    },
    descriptionText: {
      marginBottom: theme.spacing.unit * 2
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
      images
        .reduce((acc: string[], image: string) => {
          const imageObj = imagesData.find(i => i.id === image);

          if (imageObj) {
            acc.push(imageObj.label);
          }

          return acc;
        }, [])
        .join(', ') || 'No compatible images found';

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
        <Typography
          variant="body2"
          className={classes.deployments}
          data-qa-stack-deployments
        >
          {deployments_total} deployments &bull; {deployments_active} still
          active &bull; last rev.{' '}
          <DateTimeDisplay value={updated} humanizeCutoff={'never'} />
        </Typography>
        <div className={classes.description}>
          {description && (
            <Typography
              variant="body2"
              className={classes.descriptionText}
              data-qa-stack-description
            >
              {description}
            </Typography>
          )}
          <Typography variant="body2" data-qa-compatible-distro>
            <strong>Compatible with: </strong>
            {compatibleImages}
          </Typography>
        </div>
        <Typography variant="h3" className={classes.scriptHeading}>
          Script:
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
