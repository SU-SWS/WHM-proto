// Page paths in the data are normalized (Q-5): the home page is "/". This
// turns a stored path into the label shown on screen.

export function displayPath(path: string): string {
  return path === "/" ? "/ (home)" : path;
}
