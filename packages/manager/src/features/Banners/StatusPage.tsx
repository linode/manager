import * as React from 'react';
import { compose } from 'recompose';
import { makeStyles, Theme } from 'src/components/core/styles';

import {
  getActiveStatusPageIncidents,
  Incident
} from 'src/services/third_party';

import Typography from 'src/components/core/Typography';
import DateTime from 'src/components/DateTimeDisplay';
import Notice from 'src/components/Notice';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(3)
  },
  link: {
    color: theme.color.selectDropDowns
  }
}));

interface Props {
  howManyIncidentsToShow: number;
}

type CombinedProps = Props;

const StatusPageBanner: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const [incidents, setIncidents] = React.useState<Incident[]>([]);

  React.useEffect(() => {
    getActiveStatusPageIncidents()
      .then(response => {
        setIncidents(response);
      })
      .catch(e => e);
  }, []);

  return (
    <div className={classes.root}>
      {incidents
        .filter((eachIncident, index) => index < props.howManyIncidentsToShow)
        .map(eachIncident => {
          return (
            <Notice important warning key={eachIncident.name}>
              <Typography variant="h2">{eachIncident.name}</Typography>
              <a href={eachIncident.shortlink} target="_blank">
                <DateTime
                  className={classes.link}
                  value={eachIncident.incident_updates[0].updated_at}
                />
              </a>{' '}
              {eachIncident.incident_updates[0].body}
            </Notice>
          );
        })}
    </div>
  );
};

export default compose<CombinedProps, Props>(React.memo)(StatusPageBanner);
