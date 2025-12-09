# Changesets

This directory gets auto-populated when running `pnpm changeset`.
You can however add your changesets manually as well, knowing that the [TYPE] is limited to the following options `Added`, `Fixed`, `Changed`, `Removed`, `Tech Stories`, `Tests`, `Upcoming Features` and follow this format:

```md
---
"@linode/[PACKAGE]": [TYPE]
---

My PR Description ([#`PR number`](`PR link`))
```

You must commit them to the repo so they can be picked up for the changelog generation.

This directory get wiped out when running `pnpm generate-changelog`.

See `changeset.mjs` for implementation details.
