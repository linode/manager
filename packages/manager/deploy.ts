import { $ } from 'bun';

await $`pnpm build`.env({
  ...process.env,
  REACT_APP_LOGIN_ROOT: 'https://login.linode.com',
  REACT_APP_API_ROOT: 'https://api.linode.com/v4',
  REACT_APP_CLIENT_ID: '4f29e75764f1f25431d7',
  REACT_APP_APP_ROOT: 'https://cloud.nussman.us',
});

await $`scp -r ./build/* root@192.168.0.114:/usr/share/caddy/manager`;
