import { Field } from "./components/Field";
import { Ledger, FootRule } from "./components/Ledger";

/**
 * SIGNAL / LEDGER — the field is the face, the ledger is the body.
 * A generative drawing fed by live market data, over an engineering-style
 * index of the actual work. One world, no toggle: the duality is in the
 * material (markets drive the art, code renders it), not in a theme switch.
 */
export function App() {
  return (
    <>
      <a href="#index" className="skip-link">
        Skip to the index
      </a>
      <Field />
      <main id="main-content" tabIndex={-1}>
        <Ledger />
      </main>
      <FootRule />
    </>
  );
}
