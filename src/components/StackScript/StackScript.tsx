import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ExternalLink from 'src/components/ExternalLink';
import ScriptCode from 'src/components/ScriptCode';
import { getImagesByIds } from 'src/services/images';

type CSSClasses = 'root' | 'deployments' | 'author' | 'description' | 'scriptHeading' | 'imagesList';

const styles: StyleRulesCallback<CSSClasses> = (theme) => {
  return ({
    root: {
      backgroundColor: theme.color.white,
      padding: theme.spacing.unit * 4
    },
    deployments: {
      color: theme.color.grey1
    },
    author: {
      marginTop: theme.spacing.unit * 2,
      marginBottom: theme.spacing.unit * 2,
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
      marginBottom: theme.spacing.unit,
    },
    imagesList: {
      marginTop: theme.spacing.unit * 2,
    }
  });
};

export interface Props {
 data: Linode.StackScript.Response;
}

export interface State {
  imagesList: Linode.Image[];
}


type PropsWithStyles = Props & WithStyles<CSSClasses>;

export class StackScript extends React.Component<PropsWithStyles, {}> {

  state: State = {
    imagesList: []
  }

  componentDidMount() {
    const { data: { images } } = this.props;

    getImagesByIds(images).then(imagesList => {
      this.setState({ imagesList });
    })
  }

  render() {
    const {
      classes,
      data: {
        username,
        deployments_total,
        deployments_active,
        description,
        script,
        updated,
      },
    } = this.props;

    const { imagesList } = this.state;

    return (
      <div className={classes.root}>
        <Typography role="header" variant="h1" component="h2">
          About the StackScript
        </Typography>
        <Typography variant="h3" className={classes.author}>
          by&nbsp;
          <ExternalLink text={username} link={`https://www.linode.com/stackscripts/profile/${username}`} />
        </Typography>
        <Typography variant="body2" className={classes.deployments}>
          {deployments_total} deployments &bull; {deployments_active} still active &bull; last rev. <DateTimeDisplay value={updated} humanizeCutoff={"never"} />
        </Typography>
        <div className={classes.description}>
          <Typography variant="body2">
            { description }
          </Typography>
          {imagesList.length !== 0 && <Typography variant="body2" className={classes.imagesList}>
            <strong>Compatible with: </strong>
            { imagesList.map(image => image.label).join(', ' ) }
          </Typography>}
        </div>
        <Typography variant="h3" className={classes.scriptHeading}>
          Script:
        </Typography>
        <ScriptCode script={script} />
      </div>
    )
  }
};

const styled = withStyles(styles);

export default styled(StackScript);
