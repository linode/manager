import { TPAProvider } from '@linode/api-v4/lib/profile';
import GitHubIcon from 'src/assets/icons/providers/github-logo.svg';
import GoogleIcon from 'src/assets/icons/providers/google-logo.svg';

export type ProviderOptions = Exclude<TPAProvider, 'password'>;

export interface Provider {
  name: ProviderOptions;
  displayName: string;
  Icon: any;
}

export const providers: Provider[] = [
  { name: 'google', displayName: 'Google', Icon: GoogleIcon },
  { name: 'github', displayName: 'GitHub', Icon: GitHubIcon },
];
