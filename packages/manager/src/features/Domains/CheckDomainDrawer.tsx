import * as React from 'react';

import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
import ExternalLink from 'src/components/ExternalLink';
import Grid from 'src/components/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  copyContainer: {
    backgroundColor: theme.color.grey5,
    margin: `${theme.spacing(2)}px ${theme.spacing()}px`,
    borderRadius: theme.shape.borderRadius,
    maxWidth: '100%'
  },
  copyCode: {
    overflowX: 'auto'
  },
  documentation: {
    marginTop: theme.spacing(3)
  }
}));

interface Props {
  domainLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export type CombinedProps = Props;

/**
 * Shell command; when run with these arguments, generates output
 * similar to the Zone files that Linode previously made available.
 * (using dig guarantees that the information is up to date and accurate,
 * which is not necessarily the case using older zone files).
 */
const generateCommand = (label: string) =>
  `dig +nocomments +nocmd @ns1.linode.com ${label} +multiline +nostats`;

export const CheckDomainDrawer: React.FC<Props> = props => {
  const { domainLabel, isOpen, onClose } = props;
  const classes = useStyles();
  const command = generateCommand(domainLabel);
  return (
    <Drawer title={`Check Domain Status`} open={isOpen} onClose={onClose}>
      <Typography>
        To view the most up-to-date information about your Domain and its
        status, you will need to ssh into your Linode and run the following
        command:
      </Typography>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        className={classes.copyContainer}
      >
        <CopyTooltip text={command} />
        <pre className={classes.copyCode}>
          <code>{command}</code>
        </pre>
      </Grid>
      <Typography className={classes.documentation}>
        For more information about zone status and the <code>dig</code> command,
        please{' '}
        <ExternalLink text="click here" link="https://www.linode.com/docs/" />.
      </Typography>
    </Drawer>
  );
};

export default CheckDomainDrawer;
