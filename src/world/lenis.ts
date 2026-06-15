import type Lenis from "lenis";

/**
 * Shared handle to the active Lenis instance so non-hook code (e.g. the world
 * flip's scroll re-anchoring) can drive scrolling. Set by useLenis on mount.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
