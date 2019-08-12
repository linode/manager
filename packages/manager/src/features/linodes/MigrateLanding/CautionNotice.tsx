import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import Checkbox from 'src/components/CheckBox';
import Typography from 'src/components/core/Typography';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: theme.bg.white,
    '& ul:first-of-type': {
      fontFamily: theme.font.normal,
      '& li': {
        marginBottom: theme.spacing()
      }
    }
  },
  header: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2)
  },
  volumes: {
    marginTop: theme.spacing(),
    '& li': {
      fontFamily: theme.font.bold
    }
  },
  checkbox: {
    marginLeft: theme.spacing(2)
  }
}));

interface Props {
  linodeVolumes?: Linode.Volume[];
}

type CombinedProps = Props;

const CautionNotice: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  return (
    <Notice warning className={classes.root} spacingTop={24}>
      <Typography className={classes.header}>
        <strong>Caution:</strong>
      </Typography>
      <ul>
        <li>
          You'll be assigned new IPv4 and IPv6 addresses, which will be
          accessible once your migration is complete
        </li>
        <li>
          Any existing backups with the Linode Backup Service will not be
          migrated. Once your migration is complete, your backups will start
          over on their existing schedule.
        </li>
        <li>
          Any DNS records (including Reverse DNS) will need to be updated. You
          can use the DNS Manager or Configure Your Linode for Reverse DNS
          (rDNS).
        </li>
        <li>Your Linode will be powered off.</li>
        {props.linodeVolumes && (
          <React.Fragment>
            <li>
              Block Storage can't be migrated to other regions. The following
              volumes will be detached from this Linode:
            </li>
            <ul className={classes.volumes}>
              {props.linodeVolumes.map(eachVolume => {
                return <li key={eachVolume.id}>{eachVolume.label}</li>;
              })}
            </ul>
          </React.Fragment>
        )}
      </ul>
      <Checkbox text="Accept" className={classes.checkbox} />
    </Notice>
  );
};

export default compose<CombinedProps, Props>(React.memo)(CautionNotice);
