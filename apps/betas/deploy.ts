import { $ } from 'bun';

await $`pnpm build`.env({
  ...process.env,
  REACT_APP_CLIENT_ID: '88a1c71c5558497f80d8',
  REACT_APP_APP_ROOT: 'https://betas.nussman.us',
});

await $`scp -r ./dist/* root@192.168.0.114:/usr/share/caddy/betas`;
