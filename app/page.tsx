import { getAllSites } from "@/lib/data/load";
import { describeSection } from "@/lib/data/provenance";

// Placeholder for task 2: proves the build reads every site's published data.
// Task 3 replaces this with the portfolio rollup.
export default function Home() {
  const sites = getAllSites();
  return (
    <>
      <header className="bg-cardinal-red py-10">
        <div className="centered-container">
          <a className="logo text-white hocus:text-white text-20" href="https://www.stanford.edu">
            Stanford University
          </a>
        </div>
      </header>
      <main id="main-content" className="centered-container py-50">
        <h1 className="font-serif type-5 mb-20">Website Health Monitoring</h1>
        <ul className="list-none p-0">
          {sites.map((site) => {
            const score = site.readings.siteTargetScore;
            const origin = describeSection({
              provider: "siteimprove",
              source: score.source,
              date: site.checkedAt,
            });
            return (
              <li key={site.siteKey} className="mb-20">
                <h2 className="type-2 mb-4">{site.name}</h2>
                <p className="mb-4">Site Target Score: {score.value} (goal {score.goal})</p>
                <p className="text-black-70">{origin.text}</p>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
