import { UserPreferences } from '@linode/api-v4';
import { ThemeChoice } from 'src/LinodeThemeWrapper';

export interface ManagerPreferences extends UserPreferences {
  theme: ThemeChoice;
}
