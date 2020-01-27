import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ExternalLink from 'src/components/ExternalLink';
import Placeholder from 'src/components/Placeholder';

const useStyles = makeStyles((theme: Theme) => ({
  copy: {
    marginTop: 16
  }
}));

type LongviewFeature =
  | 'Processes'
  | 'Network'
  | 'Disks'
  | 'Apache'
  | 'NGINX'
  | 'MySQL';

interface Props {
  title: LongviewFeature;
  clientLabel: string;
}

type CombinedProps = Props;

const FeatureComingSoon: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const baseURL = 'https://manager.linode.com/longview';
  const link = `${baseURL}/${props.title.toLowerCase()}/${props.clientLabel}`;

  return (
    <React.Fragment>
      <Placeholder
        title={props.title}
        copy={
          <Typography variant="subtitle1" className={classes.copy}>
            This feature is coming in a future release, but you can access it
            now in <ExternalLink link={link} text="Classic Manager." />
          </Typography>
        }
      />
    </React.Fragment>
  );
};

export default FeatureComingSoon;
