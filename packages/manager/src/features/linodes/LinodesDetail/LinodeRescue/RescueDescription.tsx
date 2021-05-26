import * as React from 'react';
import Typography from 'src/components/core/Typography';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { makeStyles, Theme } from 'src/components/core/styles';
import Link from 'src/components/Link';

const rescueDescription = {
  text: `If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot your Linode into Rescue Mode. This is a safe environment for performing many system recovery and disk management tasks.`,
  link: 'https://www.linode.com/docs/guides/rescue-and-rebuild/',
};

interface Props {
  linodeId?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(1),
  },
  lishLink: theme.applyLinkStyles,
}));

const RescueDescription: React.FC<Props> = (props) => {
  const { linodeId } = props;
  const classes = useStyles();

  /**
   * Pass the prop 'linodeId' when you want to include a note about
   * connection with LISH upon reboot into Rescue Mode. This is
   * intended for the Bare Metal dialog.
   */
  return (
    <React.Fragment>
      <Typography>
        {rescueDescription.text}{' '}
        <Link to={rescueDescription.link}>Learn more.</Link>
      </Typography>
      {linodeId ? (
        <Typography className={classes.copy}>
          {`When your Linode has successfully rebooted into Rescue Mode, use the `}
          <button
            className={classes.lishLink}
            onClick={() => lishLaunch(linodeId)}
          >
            LISH Console
          </button>
          {` to access it.`}
        </Typography>
      ) : null}
    </React.Fragment>
  );
};

export default RescueDescription;
