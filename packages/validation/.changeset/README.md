# Changesets

This directory gets auto-populated when running `yarn changeset`.
You can however add your changesets manually as well, knowing that the [TYPE] is limited to the following options `Added`, `Fixed`, `Changed`, `Removed`, `Tech Stories`, `Tests`, `Upcoming Features` and follow this format:

```md
---
"@linode/[PACKAGE]": [TYPE]
---

My PR Description ([#`PR number`](`PR link`))
```

You must commit them to the repo so they can be picked up for the changelog generation.

This directory get wiped out when running `yarn generate-changelog`.

See `changeset.mjs` for implementation details.

## Best Practices

- Use a single tense in all our changeset entries. We have chosen to use **imperative (present)** tense. (This follows established [git commit message best practices](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html).)
- Avoid starting a changeset with the verb "Add", "Remove", or "Fix" when listed under that respective "Added", "Removed", or "Fixed" section. It is unnecessary repetition.
- For Fixed changesets, describe the bug that needed to be fixed, rather than the fix itself. (e.g. say "Missing button labels in action buttons" rather than "Make label prop required for action buttons").
- Begin a changeset with a capital letter, but do not end it with a period; it's not a complete sentence.
- When referencing code, consider adding backticks for readability. (e.g. "Update `updateImageRegions` to accept `UpdateImageRegionsPayload` instead of `regions: string[]`").
- Use the "Upcoming Features" section for ongoing project work that is behind a feature flag. If additional changes are being made that are not feature flagged, add another changeset to describe that work.
- Generally, if the code change is a fix for a previous change that has been merged to `develop` but was never released to production, we don't need to include a changeset.
