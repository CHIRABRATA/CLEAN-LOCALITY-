import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Landing_page from "./pages/Landing_page";
import Login from "./pages/Login";
import PostPage from "./pages/PostPage";
import CitizenProfile from "./pages/Profile/Citizen";
import ReportPage from "./pages/Reportpage";
import PendingRequests from "./pages/PendingRequests";

function App() {

  const [session,setSession] = useState(null);
  const [loading,setLoading] = useState(true);
  const [route,setRoute] = useState(()=>window.location.hash || "#/");
  const [isVerified, setIsVerified] = useState(false);
  const [checkingVerification, setCheckingVerification] = useState(true);

  useEffect(() => {
    let channel = null;
    let isMounted = true;

    const initVerification = async () => {
      const userId = session?.user?.id;
      const userRole = session?.user?.user_metadata?.user_role;

      if (!userId || userRole !== "authority") {
        if (isMounted) {
          setIsVerified(false);
          setCheckingVerification(false);
        }
        return;
      }

      console.log("🔍 Checking verification for:", userId);
      setCheckingVerification(true);
      
      try {
        // 1. Initial Fetch with Retry logic for network issues
        let retryCount = 0;
        let data = null;
        let error = null;

        while (retryCount < 2) {
          const result = await supabase
            .from("authorities")
            .select("verification_status")
            .eq("id", userId)
            .maybeSingle();
          
          data = result.data;
          error = result.error;

          if (!error) break;
          
          console.warn(`⚠️ Fetch attempt ${retryCount + 1} failed, retrying...`, error.message);
          retryCount++;
          await new Promise(res => setTimeout(res, 1000)); // wait 1s before retry
        }
        
        if (error) throw error;
        
        if (isMounted) {
          if (!data) {
            console.warn("⚠️ No authority profile found in public.authorities");
            setIsVerified(false);
          } else {
            console.log("📄 Verification status:", data.verification_status);
            setIsVerified(!!data.verification_status);
          }
        }

        // 2. Setup Real-time Listener
        if (isMounted) {
          channel = supabase
            .channel(`auth-status-${userId}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'authorities',
                filter: `id=eq.${userId}`
              },
              (payload) => {
                console.log("⚡ Real-time update:", payload.new.verification_status);
                if (isMounted) setIsVerified(!!payload.new.verification_status);
              }
            )
            .subscribe();
        }

      } catch (err) {
        console.error("❌ Verification check failed:", err.message);
        // If it's a network error, we might want to let the user know or try again later
        if (err.message.includes("Failed to fetch") || err.message.includes("network")) {
          console.error("📡 Network issue detected. Please check your internet or Supabase project status.");
        }
      } finally {
        if (isMounted) setCheckingVerification(false);
      }
    };

    initVerification();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [session?.user?.id]); // Only re-run if the User ID changes

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
          const role = session.user?.user_metadata?.user_role;
          window.location.hash = role === "authority" ? "#/authority" : "#/feed";
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

  if(loading || checkingVerification){
    return <div style={loadStyle}>Loading...</div>;
  }

  // USER LOGGED IN ROUTES
  if(session){
    const role = session.user?.user_metadata?.user_role;

    if(route.startsWith("#/profile")){
      return <CitizenProfile />;
    }

    if(role === "authority"){
      if (!isVerified) {
        return <PendingRequests />;
      }
      return <ReportPage user={session.user} />;
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
