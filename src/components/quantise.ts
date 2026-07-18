/* ────────────────────────────────────────────────────────────
   Rounding for anything computed in JS that ends up as an
   attribute or an inline style on a server-rendered element.

   ECMAScript does not pin down the precision of Math.sin, cos,
   tan, exp or pow — implementations are free to approximate. Node
   and the browser can therefore differ in the last bit or two:

     server   r="75.88631444691936"
     client   r={75.88631444691934}

   React hydrates by comparing the *serialised* attribute, so a
   difference of 1e-14 is a full hydration mismatch: it logs a
   warning, refuses to patch the node, and you lose the benefit of
   SSR for that subtree.

   Quantising kills it. Three decimals of an SVG user unit, at the
   scales used here, is on the order of a thousandth of a pixel —
   nothing on screen moves.

   Use this on every value derived from trig (or any other
   irrational-producing maths) that reaches the DOM. Values built
   only from integers, +, -, * and / are exact under IEEE-754 and
   need no help. Anything computed inside an effect runs only on
   the client and is never compared, so it needs no help either.
   ──────────────────────────────────────────────────────────── */

/** Round to 3 decimals so SSR and the browser serialise it identically. */
export function q(value: number): number {
  return Math.round(value * 1000) / 1000;
}
