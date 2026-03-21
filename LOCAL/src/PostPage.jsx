import React, { useState, useRef } from "react";
import MapPicker from "../components/MapPicker";

export default function FeedPage() {

  const [step, setStep] = useState("feed");
  const [selectedImg, setSelectedImg] = useState(null);
  const [location, setLocation] = useState({ lat:null, lng:null });
  const [description, setDescription] = useState("");
  const [showMap, setShowMap] = useState(false);

  const fileInputRef = useRef(null);

  // open gallery
  const handleCamClick = () => {
    fileInputRef.current.click();
  };

  // image selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setSelectedImg(URL.createObjectURL(file));
      setStep("upload");
    }
  };

  // current location
  const getAutoLocation = () => {

    navigator.geolocation.getCurrentPosition((pos)=>{

      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });

      alert("Location captured");

    });

  };

  // post
  const handlePost = () => {

    if(!description){
      alert("Add description");
      return;
    }

    if(!location.lat){
      alert("Select location");
      return;
    }

    console.log("POST DATA:",{
      description,
      location,
      selectedImg
    });

    alert("Post created (demo)");

    setStep("feed");
    setSelectedImg(null);
    setDescription("");
  };

  return (

    <div style={{background:"#030014",minHeight:"100vh",padding:"20px"}}>

      {/* hidden input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{display:"none"}}
        onChange={handleFileChange}
      />

      {/* camera button */}
      <div
        onClick={handleCamClick}
        style={{
          position:"fixed",
          bottom:"30px",
          right:"30px",
          width:"60px",
          height:"60px",
          borderRadius:"50%",
          background:"linear-gradient(135deg,#7C3AED,#3B82F6)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          fontSize:"26px",
          cursor:"pointer"
        }}
      >
        📷
      </div>

      <h2 style={{color:"white"}}>Community Feed</h2>

      {/* upload popup */}

      {step === "upload" && (

        <div
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,0.8)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center"
          }}
        >

          <div
            style={{
              width:"420px",
              background:"#111",
              padding:"25px",
              borderRadius:"15px"
            }}
          >

            <h3 style={{color:"white"}}>Create Report</h3>

            <img
              src={selectedImg}
              style={{
                width:"100%",
                height:"200px",
                objectFit:"cover",
                borderRadius:"10px",
                marginTop:"10px"
              }}
            />

            {/* description */}

            <textarea
              placeholder="Describe the issue..."
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              style={{
                width:"100%",
                marginTop:"15px",
                padding:"10px",
                borderRadius:"10px",
                border:"none"
              }}
            />

            {/* location buttons */}

            <div style={{marginTop:"15px",display:"flex",gap:"10px"}}>

              <button onClick={getAutoLocation}>
                📍 Use Current
              </button>

              <button onClick={()=>setShowMap(true)}>
                🗺 Pick on Map
              </button>

            </div>

            {/* map */}

            {showMap && (

              <div style={{marginTop:"15px"}}>
                <MapPicker setLocation={setLocation}/>
              </div>

            )}

            {/* show location */}

            {location.lat && (

              <p style={{color:"lightgreen",marginTop:"10px"}}>
                Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>

            )}

            {/* post */}

            <button
              onClick={handlePost}
              style={{
                marginTop:"20px",
                width:"100%",
                padding:"12px",
                background:"#7C3AED",
                color:"white",
                border:"none",
                borderRadius:"10px"
              }}
            >
              Post
            </button>

          </div>

        </div>

      )}

    </div>
  );
}