import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  // api.test.ts runs under the "node" environment, which has no localStorage.
  if (typeof localStorage !== "undefined") localStorage.clear();
});
