/* ────────────────────────────────────────────────────────────
   The page is one continuous sky, top to bottom: purple at the
   hero, through cloud, into the rain over the roadmap, down to
   the footer. Nothing on the page has a visible edge — every
   section opens on exactly the colour the one above it ends on.

   These are those handover colours. Each is used twice: once as
   the last stop of a section's background (or of the cloud deck
   that closes it), and once as the first stop of the next. Change
   one and both sides move together; hard-code either side instead
   and a line appears across the page.
   ──────────────────────────────────────────────────────────── */

/* From the mist down the sky deepens: Open Mode stays pale, Noid Mode is
   plainly more violet, Multichain a step darker again, and the roadmap goes
   under the weather. Keep these in descending lightness or the page starts
   reading as separate pages again. */

/** hero's cloud deck → wallet modes */
export const HERO_SEAM = "#E3D3F8";

/** the mist between Open and Noid → the Noid block's background */
export const MIST_SEAM = "#DECBF8";

/** wallet modes → multichain */
export const MODES_SEAM = "#C6A9EF";

/** multichain → the roadmap's overcast ceiling.
    Deep enough that Multichain's last stretch is already darkening: the
    roadmap's cloud ceiling is nearly black-violet, and handing it a pale
    lilac leaves the ceiling reading as a dark stripe laid over a light sky
    rather than as weather closing in. */
export const CHAINS_SEAM = "#8467CE";

/** the roadmap (and the waitlist closing it) → the footer.
    Deep, but nowhere near black: the roadmap's cloud ceiling is the darkest
    thing on the page, and taking the sky all the way down to meet it drags
    everything from the rain to the footer into a hole. The sky only has to
    *arrive* at the clouds' tone by the time it reaches here. */
export const ROADMAP_SEAM = "#4B2F8E";
