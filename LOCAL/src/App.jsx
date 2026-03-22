import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Landing_page from "./pages/Landing_page";
import Login from "./pages/login";
import PostPage from "./pages/PostPage";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    // 1. Fetch current session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for Login/Logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) window.location.hash = "#/feed";
      else window.location.hash = "#/";
    });

    // 3. Handle manual Hash Routing
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  if (loading) return <div style={loadStyle}><div className="loader"></div></div>;

  // AUTH GUARD: If user is logged in, always show Feed regardless of hash
  if (session) {
    return <PostPage user={session.user} />;
  }

  // GUEST ROUTES: If not logged in
  if (route.startsWith("#/login")) return <Login />;
  
  return <Landing_page />;
}

const loadStyle = { height: "100vh", background: "#02000d", display: "flex", alignItems: "center", justifyContent: "center" };

export default App;