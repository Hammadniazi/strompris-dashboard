import { act, renderHook } from "@testing-library/react";
import { z } from "zod";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePersistedState } from "./usePersistedState";

const numberSchema = z.number().int().positive();

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePersistedState", () => {
  it("returns the default value when nothing is stored", () => {
    const { result } = renderHook(() =>
      usePersistedState("test.missing", numberSchema, 3),
    );
    expect(result.current[0]).toBe(3);
  });

  it("reads a valid stored value instead of the default", () => {
    localStorage.setItem("test.valid", "7");
    const { result } = renderHook(() =>
      usePersistedState("test.valid", numberSchema, 3),
    );
    expect(result.current[0]).toBe(7);
  });

  it("falls back to the default when the stored JSON is corrupted", () => {
    localStorage.setItem("test.corrupt", "{not valid json");
    const { result } = renderHook(() =>
      usePersistedState("test.corrupt", numberSchema, 3),
    );
    expect(result.current[0]).toBe(3);
  });

  it("falls back to the default when the stored value fails schema validation", () => {
    // Valid JSON, wrong shape: this is the exact case that once made the
    // Window-hours control vanish when 0 (not "positive") got persisted.
    localStorage.setItem("test.invalid-shape", "0");
    const { result } = renderHook(() =>
      usePersistedState("test.invalid-shape", numberSchema, 3),
    );
    expect(result.current[0]).toBe(3);
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() =>
      usePersistedState("test.persist", numberSchema, 3),
    );
    act(() => result.current[1](9));
    expect(localStorage.getItem("test.persist")).toBe("9");
  });

  it("re-persists the corrected default after rejecting an invalid stored value", () => {
    localStorage.setItem("test.self-heal", "-1");
    renderHook(() => usePersistedState("test.self-heal", numberSchema, 3));
    expect(localStorage.getItem("test.self-heal")).toBe("3");
  });

  it("falls back to the default without throwing if localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked (e.g. private browsing)");
    });
    const { result } = renderHook(() =>
      usePersistedState("test.blocked-read", numberSchema, 3),
    );
    expect(result.current[0]).toBe(3);
  });

  it("doesn't throw if localStorage.setItem throws (e.g. quota exceeded)", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    const { result } = renderHook(() =>
      usePersistedState("test.blocked-write", numberSchema, 3),
    );
    expect(() => act(() => result.current[1](9))).not.toThrow();
    // In-memory state still updates even though persistence silently failed.
    expect(result.current[0]).toBe(9);
  });
});
