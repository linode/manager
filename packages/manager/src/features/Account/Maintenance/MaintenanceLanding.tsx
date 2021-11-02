import * as React from 'react';
import MaintenanceTable, { MaintenanceEntities } from './MaintenanceTable';
import { DocumentTitleSegment } from 'src/components/DocumentTitle';
import { makeStyles, Theme } from 'src/components/core/styles';

const useStyles = makeStyles((theme: Theme) => ({
  noTablePadding: {
    marginBottom: theme.spacing(2),
    '& .MuiAccordionDetails-root': {
      padding: 0,
    },
    '& .MuiAccordion-root table': {
      border: 'none',
    },
  },
}));

const MaintenanceLanding: React.FC = () => {
  const classes = useStyles();
  const [accordians, setAccordians] = React.useState([
    { expanded: true },
    { expanded: true },
  ]);

  const setExpanded = (idx: number) => {
    setAccordians((old) => {
      old[idx].expanded = !old[idx].expanded;
      return [...old];
    });
  };

  const supportedMaintenanceEntities: MaintenanceEntities[] = [
    'Linode',
    'Volume',
  ];

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Maintenance" />
      <div className={classes.noTablePadding}>
        {supportedMaintenanceEntities.map((type, idx) => (
          <MaintenanceTable
            key={type}
            type={type}
            expanded={accordians[idx].expanded}
            toggleExpanded={() => setExpanded(idx)}
            addTopMargin={
              accordians[idx - 1]?.expanded && !accordians[idx].expanded
            }
          />
        ))}
      </div>
    </React.Fragment>
  );
};

export default MaintenanceLanding;
