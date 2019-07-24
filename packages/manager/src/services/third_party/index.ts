import { STATUS_PAGE_ID } from 'src/constants';
import Request, { setHeaders, setMethod, setURL } from 'src/services';

interface IncidentUpdate {
  name: string;
  body: string;
  updated_at: string;
}

export interface Incident {
  name: string;
  status: 'resolved' | 'scheduled';
  shortlink: string;
  incident_updates: IncidentUpdate[];
}

export const getActiveStatusPageIncidents = () =>
  Request<Incident[]>(
    setMethod('GET'),
    setHeaders({
      Authorization: `OAuth ${STATUS_PAGE_ID}`
    }),
    setURL(
      `https://api.statuspage.io/v1/pages/8dn0wstr1chc/incidents/active_maintenance.json`
    )
  ).then(response => response.data);
