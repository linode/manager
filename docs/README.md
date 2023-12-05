# Akamai Cloud Manager Documentation

This doc builder uses default GitHub pages and its Jekyll site builder to deploy documentation pages to [https://linode.github.io/manager](https://linode.github.io/manager).

It automatically get deployed when we release to `master`.
It can be customized easily (styles, templates) via updating its configuration and templates (see [documentation](https://just-the-docs.com/docs/configuration))

## Local Development

In order to develop locally, start by setting up your tolling locally by following the steps on this [page](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll).

This should be done from the /docs/ directory.

Once your local site is running, you can:

- modify the styles by updating `_sass/color_schemes/akamai.scss`.
- modify layouts by adding/updating HTML templates to the `_includes` directory.

See [https://just-the-docs.com/docs/customization](https://just-the-docs.com/docs/customization) for mor info.
