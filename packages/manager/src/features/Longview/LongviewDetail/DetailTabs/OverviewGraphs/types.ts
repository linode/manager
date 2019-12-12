export interface GraphProps {
  clientAPIKey: string;
  timezone: string;
  lastUpdated?: number;
  lastUpdatedError: boolean;
  start: number;
  end: number;
  isToday: boolean;
  data: any;
  error?: string;
}
