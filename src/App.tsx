import "./App.css";
import { Grid } from "./components/grid";
import { HeaderBar } from "./components/HeaderBar";

function App() {
  return (
    <main className="flex h-screen flex-col gap-2.5 overflow-hidden p-3 text-ink">
      <HeaderBar />
      <Grid />
    </main>
  );
}

export default App;
