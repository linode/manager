import * as React from 'react';

import CopyTooltip from 'src/components/CopyTooltip';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Drawer from 'src/components/Drawer';
// import ExternalLink from 'src/components/ExternalLink'; @todo uncomment when we have a doc
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

export interface Props {
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
        status, you will need to run the following command from a terminal:
      </Typography>
      <Grid
        container
        direction="row"
        wrap="nowrap"
        className={classes.copyContainer}
      >
        <CopyTooltip
          text={command}
          aria-label="Copy dig command for viewing Domain information"
        />
        <pre className={classes.copyCode}>
          <code data-testid="dig command">{command}</code>
        </pre>
      </Grid>
      {/** No guide is available or in progress. @todo uncomment when we've got one */}
      {/* <Typography className={classes.documentation}>
        For more information about zone status and the <code>dig</code> command,
        please{' '}
        <ExternalLink
          fixedIcon
          text="click here"
          link="https://www.linode.com/docs/"
          aria-label="Documentation for dig command and Domain status"
        />
        .
      </Typography> */}
    </Drawer>
  );
};

export default CheckDomainDrawer;
