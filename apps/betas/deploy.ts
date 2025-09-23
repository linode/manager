import { $ } from 'bun';

await $`pnpm build`;

await $`scp -r ./dist/* root@192.168.0.114:/usr/share/caddy/betas`;
