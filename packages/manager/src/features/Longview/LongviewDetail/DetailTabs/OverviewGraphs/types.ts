export interface GraphProps {
  clientAPIKey: string;
  end: number;
  isToday: boolean;
  lastUpdated?: number;
  lastUpdatedError: boolean;
  start: number;
  timezone: string;
}
