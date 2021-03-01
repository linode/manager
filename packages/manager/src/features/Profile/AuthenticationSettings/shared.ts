import { TPAProvider } from '@linode/api-v4/lib/profile';
import GitHubIcon from 'src/assets/icons/providers/git-hub-logo.svg';

export type ProviderOptions = Exclude<TPAProvider, 'password'>;

export interface Provider {
  name: ProviderOptions;
  displayName: string;
  Icon: any;
}

export const providers: Provider[] = [
  { name: 'github', displayName: 'GitHub', Icon: GitHubIcon },
];
