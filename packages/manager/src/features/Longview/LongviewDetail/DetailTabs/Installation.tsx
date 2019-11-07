import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';

import CopyTooltip from 'src/components/CopyTooltip';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  code: {
    whiteSpace: 'pre-wrap'
  },
  links: {
    marginTop: theme.spacing(),
    '& span:nth-child(n+2)': {
      marginLeft: theme.spacing(2),
      paddingLeft: theme.spacing(2),
      borderLeft: `solid 1px ${theme.color.grey3}`
    }
  }
}));

interface Props {
  clientInstallationKey: string;
}

type CombinedProps = RouteComponentProps & Props;

const Installation: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const command = `curl -s https://lv.linode.com/${
    props.clientInstallationKey
  } | sudo bash`;

  return (
    <Paper className={classes.root}>
      <Typography variant="subtitle2">
        Before a Longview client can gather data, you need to install the
        Longview Agent on your server by running the following command:
      </Typography>
      <pre>
        <CopyTooltip text={command} />
        <code className={classes.code}>{command}</code>
      </pre>
      <Typography variant="subtitle2">
        This should work for most installations, but if you have issues, please
        consult our troubleshooting guide and manual installation instructions:
      </Typography>
      <div className={classes.links}>
        <span>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linode.com/docs/platform/longview/longview/#troubleshooting"
          >
            Troubleshooting guide
          </a>
        </span>
        <span>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.linode.com/docs/platform/longview/longview/#manual-installation-with-yum-or-apt"
          >
            Manual installation instructions
          </a>
        </span>
      </div>
    </Paper>
  );
};

export default React.memo(Installation);
