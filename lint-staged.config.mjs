/** @type {import('lint-staged').Configuration} */
export default {
  // tsc checks the whole project, so it runs without the staged file list.
  "src/**/*.ts": ["eslint", () => "tsc --noEmit"],
};
