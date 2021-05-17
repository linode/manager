import * as React from 'react';
import ExternalLink from 'src/components/ExternalLink';
import Typography from 'src/components/core/Typography';
import { lishLaunch } from 'src/features/Lish/lishUtils';
import { makeStyles, Theme } from 'src/components/core/styles';

const rescueDescription = {
  text: `If you suspect that your primary filesystem is corrupt, use the Linode Manager to boot your Linode into Rescue Mode. This is a safe environment for performing many system recovery and disk management tasks.`,
  link: 'https://www.linode.com/docs/guides/rescue-and-rebuild/',
};

interface Props {
  linodeId: number;
}

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: theme.spacing(1),
  },
  lishLink: theme.applyLinkStyles,
}));

const RescueDescription = (props: Props) => {
  const { linodeId } = props;
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography>
        {rescueDescription.text}{' '}
        <ExternalLink
          fixedIcon
          text="Learn more."
          link={rescueDescription.link}
        />
      </Typography>
      <Typography className={classes.copy}>
        {`When your Linode has successfully rebooted into Rescue Mode, use the `}
        <button
          className={classes.lishLink}
          onClick={() => lishLaunch(linodeId)}
        >
          LISH Console
        </button>
        {` to access it. `}
        <ExternalLink
          fixedIcon
          text="Learn more."
          link="https://www.linode.com/docs/guides/rescue-and-rebuild/#connecting-to-a-linode-running-in-rescue-mode"
        />
      </Typography>
    </React.Fragment>
  );
};

export default RescueDescription;
