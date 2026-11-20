// Placeholder for task 1: proves the Decanter preset and fonts work after
// deploy. Task 3 replaces this with the portfolio rollup.
export default function Home() {
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
        <p className="type-1 max-w-prose">
          This is the starting point for the WHM prototype. The site health
          pages come next.
        </p>
      </main>
    </>
  );
}
