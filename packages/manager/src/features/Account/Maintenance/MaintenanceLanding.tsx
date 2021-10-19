import * as React from 'react';
import Accordion from 'src/components/Accordion';
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

  const supportedMaintenanceEntities = ['Linode', 'Volume'];

  const renderTable = (type: MaintenanceEntities) => (
    <Accordion heading={`${type}s`} defaultExpanded>
      <MaintenanceTable type={type} />
    </Accordion>
  );

  return (
    <React.Fragment>
      <DocumentTitleSegment segment="Maintenance" />
      <div className={classes.noTablePadding}>
        {supportedMaintenanceEntities.map(renderTable)}
      </div>
    </React.Fragment>
  );
};

export default MaintenanceLanding;
