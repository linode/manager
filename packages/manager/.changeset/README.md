# Changesets

This directory gets auto-populated when running `yarn changeset`.
You can however add your changesets manually as well, knowing that your types are limited to `Added`, `Fixed`, `Changed`, `Removed`, `Tech Stories`, and follow this format:

```md
---
"@linode/manager": `type`
---

My PR Description ([#`pr number`](`pr link`))
```

You must commit them to the repo so they can be picked up for the changelog generation.

This directory get wiped out when running `yarn generate-changelog`.

See `changeset.mjs` for implementation details.