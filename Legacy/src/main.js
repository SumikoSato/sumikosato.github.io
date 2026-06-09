/**
 * @file Legacy entry point — loads polyfills then boots the game.
 * Loaded by Rollup as the bundle entry (IIFE, no ES modules).
 *
 * Load order (defined in index.html):
 *   1. polyfills.js  (synchronous <script>)
 *   2. legacy.bundle.js  (this file, bundled by Rollup)
 *
 * The game initialises itself once the DOM is ready.
 */

/* Bootstrap: everything is bundled into a single IIFE by Rollup.
 * Side-effect imports execute their top-level code on load. */
import "./game.js";
