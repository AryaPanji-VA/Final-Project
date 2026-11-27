// App.jsx only composes routing. Every page, layout and guard is declared in
// src/routes/app-routes.jsx.
import { AppRoutes } from "./routes/app-routes.jsx";

function App() {
  return <AppRoutes />;
}

export default App;
