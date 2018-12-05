import * as React from 'react';
import { StyleRulesCallback, withStyles, WithStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import ScriptCode from 'src/components/ScriptCode';

type CSSClasses = 'root' | 'deployments' | 'author' | 'description' | 'scriptHeading';

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
      whiteSpace: 'pre',
      borderTop: `1px solid ${theme.color.grey2}`,
      borderBottom: `1px solid ${theme.color.grey2}`
    },
    scriptHeading: {
      marginBottom: theme.spacing.unit,
    }
  });
};

export interface Props {
 data: Linode.StackScript.Response;
}

type PropsWithStyles = Props & WithStyles<CSSClasses>;

export class StackScript extends React.Component<PropsWithStyles, {}> {

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

    return (
      <div className={classes.root}>
        <Typography role="header" variant="h1">
          About the StackScript
        </Typography>
        <Typography variant="h3" className={classes.author}>
          by&nbsp;
          <a target="_blank" href={`https://www.linode.com/stackscripts/profile/${username}`}>{username}</a>
        </Typography>
        <Typography variant="body2" className={classes.deployments}>
          {deployments_total} deployments &bull; {deployments_active} still active &bull; last rev. <DateTimeDisplay value={updated} humanizeCutoff={"never"} />
        </Typography>
        <Typography variant="body2" className={classes.description}>
          {description}
        </Typography>
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
