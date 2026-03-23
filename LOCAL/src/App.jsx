import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Landing_page from "./pages/Landing_page";
import Login from "./pages/login";
import PostPage from "./pages/PostPage";
import CitizenProfile from "./pages/Profile/Citizen";

function App() {

  const [session,setSession] = useState(null);
  const [loading,setLoading] = useState(true);
  const [route,setRoute] = useState(()=>window.location.hash || "#/");

  useEffect(()=>{

    // get session
    supabase.auth.getSession().then(({data:{session}})=>{
      setSession(session);
      setLoading(false);
    });

    // listen login/logout
    const { data:{subscription} } =
      supabase.auth.onAuthStateChange((_event,session)=>{
        setSession(session);

        if(session){
          window.location.hash = "#/feed";
        } else {
          window.location.hash = "#/";
        }
      });

    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);

    return ()=>{
      subscription.unsubscribe();
      window.removeEventListener("hashchange", onHashChange);
    };

  },[]);

  if(loading){
    return <div style={loadStyle}>Loading...</div>;
  }

  // USER LOGGED IN ROUTES
  if(session){

    if(route.startsWith("#/profile")){
      return <CitizenProfile />;
    }

    return <PostPage user={session.user} />;
  }

  // NOT LOGGED IN ROUTES
  if(route.startsWith("#/login")){
    return <Login />;
  }

  return <Landing_page />;

}

const loadStyle = {
  height:"100vh",
  background:"#02000d",
  display:"flex",
  alignItems:"center",
  justifyContent:"center"
};

export default App;