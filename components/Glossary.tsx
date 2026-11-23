// "What these terms mean" (Q-3): plain-language explanations of the words the
// site page uses. Draft for SWS review (decisions, Nov 23).

const TERMS: { term: string; meaning: string }[] = [
  {
    term: "Site Target Score",
    meaning:
      "Stanford’s main measure for the site, set with Siteimprove and based on Siteimprove’s accessibility checks. It runs from 0 to 100, and every Stanford site is expected to reach 100.",
  },
  {
    term: "Accessibility score",
    meaning:
      "Siteimprove’s score, out of 100, for how well the site works for people with disabilities, such as people using screen readers. Fewer and smaller accessibility problems mean a higher score.",
  },
  {
    term: "Check",
    meaning: "Siteimprove looks through the whole site on a regular schedule. Each look is a check, and the numbers here come from the latest one.",
  },
  {
    term: "Broken links",
    meaning: "Links on your pages that lead to a page that doesn’t exist.",
  },
  {
    term: "Page views",
    meaning: "How many times visitors opened a page during the period shown.",
  },
  {
    term: "Busiest pages",
    meaning:
      "Your 5 pages with the most page views. Search, sign-in and “page not found” pages are left out, because they’re part of the Stanford Sites platform.",
  },
  {
    term: "Engagement rate",
    meaning:
      "The share of visits that lasted over 10 seconds, viewed 2 or more pages, or completed a key event. A low rate can mean visitors didn’t find what they came for.",
  },
];

export function Glossary() {
  return (
    <details className="mt-16 max-w-[768px]">
      <summary className="cursor-pointer font-semibold">What these terms mean</summary>
      <dl className="m-0 mt-8 text-16">
        {TERMS.map((t) => (
          <div key={t.term} className="mb-8">
            <dt className="font-semibold">{t.term}</dt>
            <dd className="ml-0">{t.meaning}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
