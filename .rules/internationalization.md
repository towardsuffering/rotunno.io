# Internationalization

**Important** Users should first run the command `npm run config-i18n` and follow the script instructions to configure their site i18n setup (one language, or multiple). This will create the necessary files and directories for internationalization.

## Text Translations

Say we have this text translation object in `src/config/translationData.json.ts`:

```ts title="src/config/translationData.json.ts"
export const textTranslations = {
  en: {
    hero_text: "Everything you need for an amazing website.",
  },
  fr: {
    hero_text: "Tout ce dont vous avez besoin pour un site Web incroyable.",
  },
} as const;
```

You use it like:

```ts
import { useTranslations } from "@/js/translationUtils";

const t = useTranslations("fr");
t("hero_text"); // this would be "Tout ce dont vous avez besoin pour un site Web incroyable."
```

## Route Translations

Route translations first attempt to match entire strings, and will then look for
wildcards. This is useful for SEO purposes, and works in conjunction with the
`localizedCollections` object.

Say we have this route translation object in `src/config/translationData.json.ts`:

```ts title="src/config/translationData.json.ts"
export const routeTranslations = {
  en: {
    aboutKey: "about",
    categoryKey: "categories",
    categoryKey2: "categories/*",
    categoryKey3: "categories",
  },
  es: {
    aboutKey: "acerca",
    categoryKey: "categorias",
    categoryKey2: "categorias/*",
    categoryKey3: "categorias",
  },
} as const;
```

This is used by the language switcher such that if you are on the english "/about" route, and switch to spanish, it will go to the "/acerca" route. It will also match "/categories/wizard" in english to "/categorias/" in spanish, and "/categorias/mago" in spanish to "/categories" in english. This is useful for SEO purposes in cases where items are dynamic but not strictly content collections.

## Content Collection Localization

### Content Collection Filtering

Content collection are setup like `src/data/blog/en/` and `src/data/blog/fr/`. You can filter them
like this:

```ts
import { filterCollectionByLanguage } from "@/js/localeUtils";

const services = await getCollection("services", ({ data }) => {
  // filter out draft services
  return data.draft !== true;
});

// get rid of pages from other languages and remove locale from slug
const filteredServices = filterCollectionByLanguage(services, "fr");
```

or like this for blog posts specifically:

```ts
import { getAllPosts } from "@/js/blogUtils";

// gets all blog post under src/data/blog/fr/
const posts = await getAllPosts("fr");
```

### Frontmatter "mappingKey"

<Badge class="mr-1" text="New" variant="info" size="md" /> This is used to
translate individual blog posts and other content collections. For example, if
you have a blog post in english with the slug "example-one", and you want to
translate it to french as "example-un", you can add a "mappingKey" to the
frontmatter of each entry and it will be used to map the blog post to the
correct locale for language switcher and SEO purposes.

```ts title="src/data/blog/en/example-one.mdx"
---
mappingKey: "key-one"
---
```

```ts title="src/data/blog/fr/example-un.mdx"
---
mappingKey: "key-one"
---
```

This feature is enabled by setting up the content collection in the `src/config/translationData.json.ts` file `localizedCollections` object.

```ts title="src/config/translationData.json.ts"
export const localizedCollections = {
  blog: {
    en: "blog",
    fr: "blog",
  },
  // Add more collections/locales as needed
} as const;
```

### Keystatic Configuration for i18n

Keystatic is configured to manage content collections in a way that supports internationalization by defining separate collections for each language. This works in tandem with Astro's content collection structure, typically mirroring the directory setup like `src/data/blog/en/`.

In `keystatic.config.tsx`, you'll find collections defined for each language variant:

```ts
// Example from keystatic.config.tsx
export default config({
  // ... other configurations
  collections: {
    blogEN: Collections.Blog("en"), // Manages content in src/data/blog/en/
    blogFR: Collections.Blog("fr"), // Manages content in src/data/blog/fr/

    otherPagesEN: Collections.OtherPages("en"), // Manages 'otherPages' in English (e.g., src/data/other-pages/en/)
    otherPagesFR: Collections.OtherPages("fr"), // Manages 'otherPages' in French (e.g., src/data/other-pages/fr/)
    // ... more collections as needed
  },
});
```

- Each language-specific collection in Keystatic (e.g., `blogEN`, `blogFR`) corresponds to a language-specific directory within your Astro content collections (e.g., `src/data/blog/en/`, `src/data/blog/fr/`).
- When you create or edit content through the Keystatic interface (usually accessible at `/admin` or `/keystatic`), you will be working within these distinct language-specific collections.

**Important Note for `authors` Collection:**

Due to current limitations with Keystatic's relationship fields and robust i18n features for linked entries, the `authors` collection is typically handled as a single collection. As noted in your `keystatic.config.tsx`:

```ts
// keystatic.config.tsx excerpt
    // for now there is a limitation with keystatic where relationship fields don't work well with i18n features
    // If you need multiple languages here (you might not) just create multiple variants of the same author
    // this might look like "author-1-en" and "author-1-fr"
    authors: Collections.Authors(""),
```

If you need to provide author information in multiple languages, the recommended workaround is to create separate author entries with language indicators in their slugs (e.g., `john-doe-en.mdx`, `john-doe-fr.mdx`). These individual, language-specific author entries can then be linked from your blog posts or other content collections as required.

This Keystatic setup ensures that content is managed and segregated by language, aligning with the overall i18n strategy of the project documented here.
