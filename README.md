# Welcome to the "Kitchen Sink" Starter!

This is a massive starter project with landing pages and sections for SaaS, Portfolio, Services, and Blog websites, all with a more minimal design so you can delete what you don't need and use AI to update the designs. It comes with:

- Blog with pagination, categories, tags, two blog post layouts including one with a table of contents
- Author pages
- Services landing page example with various sections
- Services Index and individual service pages
- Portfolio landing page example with various sections
- Projects index and individual project pages
- Resume page
- Career index and individual career posting pages
- AI rule files for cursor / windsurf - specifically for general rules, a style guide, and internationalization features
- Content collections / keystatic setup for blog posts, authors, services, projects, resume, career, and other pages (like legal)
- Pricing sections
- SaaS landing page example with various sections
- sign up, login, and forgot password pages
- Overview page and section demos
- I18n capabilities with config script
- Animations
- SEO setup

## Astro 6 Notes

- This starter project now runs on Astro 6.
- Node `>=22.12.0` is required.
- `pnpm` is recommended for installs and local testing.
- Keystatic currently works on Astro 6 via the `pnpm.peerDependencyRules.allowedVersions` workaround in `package.json` because `@keystatic/astro` does not yet officially declare Astro 6 support.

## Getting Started

1. To get started, first install all necessary packages with `npm install` or `pnpm install`, then run an initial build to make sure the setup works `npm run build` or `pnpm build`.
2. Next, you'll want to configure your site i18n setup (one language, or multiple). Simply run the command `npm run config-i18n` and follow the script instructions to get setup! For further information, see the [i18n documentation](https://cosmicthemes.com/docs/i18n/).
3. Now you can setup the site to your liking!
   - [Style customization](https://cosmicthemes.com/docs/styles/)
   - [Content editing](https://cosmicthemes.com/docs/content/)
   - [Animations](https://cosmicthemes.com/docs/animations/)
   - [Keystatic CMS](https://cosmicthemes.com/docs/keystatic/) - if you don't want Keystatic you can run `npm run remove-keystatic`
   - [Forms](https://cosmicthemes.com/docs/contact-form/)

Should you need any assistance, send me a message at support@cosmicthemes.com

## More Resources

- See my blog post on [recommended Astro web development setup](https://cosmicthemes.com/blog/astro-web-development-setup/).
- You can learn more information from the [theme docs](https://cosmicthemes.com/docs/) page on the [Cosmic Themes Website](https://cosmicthemes.com/).
- For support, see the [support page](https://cosmicthemes.com/support/).
- [License details](https://cosmicthemes.com/license/)

## General Astro Info

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory. I also frequently use `src/assets` for images when using Astro asssets for image optimization.

### Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Not supported with the current `@astrojs/netlify` setup |
| `pnpm --package=netlify-cli dlx netlify dev --context production` | Runs the built site locally using Netlify's local server/runtime |
| `npx netlify dev --context production` | Runs the built site locally using Netlify's local server/runtime |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

Use Netlify CLI instead of `npm run preview` / `pnpm preview` for local production-style testing. This is due to the current Netlify adapter setup.

### Want to learn more?

Feel free to check [the documentation](https://docs.astro.build) or jump into the [Discord server](https://astro.build/chat).
