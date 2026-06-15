import { WorldProvider } from "./world/WorldContext";
import { useLenis } from "./world/useLenis";
import { Atmosphere } from "./components/Atmosphere";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Bridge } from "./components/Bridge";
import { Experience } from "./components/Experience";
import { Work } from "./components/Work";
import { Signal } from "./components/Signal";
import { Skills } from "./components/Skills";
import { Voices } from "./components/Voices";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";

function Site() {
  useLenis();
  return (
    <>
      <Atmosphere />
      <Nav />
      <main>
        <Hero />
        <Bridge />
        <Experience />
        <Work />
        <Signal />
        <Skills />
        <Voices />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <WorldProvider>
      <Site />
    </WorldProvider>
  );
}
