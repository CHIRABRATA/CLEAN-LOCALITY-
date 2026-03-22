import { useEffect, useState } from "react";
import Landing_page from "./pages/Landing_page";
import Login from "./pages/login";
import PostPage from "./pages/PostPage";

function App() {

  const [route, setRoute] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (route.startsWith("#/login")) {
    return <Login />;
  }

  if (route.startsWith("#/feed")) {
    return <PostPage />;
  }

  return <Landing_page />;
}

export default App;