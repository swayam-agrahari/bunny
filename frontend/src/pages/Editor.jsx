import { useRef,useEffect, useState } from "react";
import {
  Grid,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import WaveformTimeline from "../components/WaveformTimeline";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { backendApi } from "../utils/api";

const Editor = () => {
  const videoRef = useRef(null);
  const variable = useSelector((state) => state.myVariable.value);
  const [finalUrl,setFinalUrl] = useState(variable)
  const location = useLocation();

  const getVideoDetails= async()=>{
    const id = getLastEditorId();
    try {
      const response = await backendApi.get(`/api/project/${id}`);
      const { video_url } = response.data;
      console.log("Video URL:", video_url);
      const response2 = await getUrl(video_url);
      if (response2!=false){
        setFinalUrl(response2)
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  }

  const getLastEditorId = () => {
    const segments = location.pathname.split("/");
    return segments[segments.length - 1];
  };

  const getUrl = async (url) => {
    try {
      if (!url.includes('commons.wikimedia.org')) {
        return false; 
      }
      const match = url.match(
        /^https:\/\/commons\.wikimedia\.org\/wiki\/(.+)$/
      );
      if (!match) {
        return false;
      }

      const pageTitle = decodeURI(match[1]); // Ensure the title is decoded properly
      console.log("Page Title:", pageTitle);

      const params = {
        action: "query",
        format: "json",
        prop: "videoinfo", // Include 'videoinfo' to get video details
        titles: pageTitle,
        viprop: "user|url|canonicaltitle|comment|url", // Fetch specific video properties
        origin: "*",
      };

      const res = await fetch(
        `https://commons.wikimedia.org/w/api.php?${new URLSearchParams(params)}`
      );

      const response = await res.json();
      const { pages } = response.query;

      if (Object.keys(pages)[0] !== '-1') {
        const { url } = pages[Object.keys(pages)[0]].videoinfo[0];
        if (url.length>0){
          return url
        }
      }
    } catch (error) {
    console.error("Error:", error);
    return false;
    }
  };

  useEffect(() => {
    getVideoDetails();
  }, []);


  return (
    <Grid container sx={{ height: "100vh", backgroundColor: "#121212" }}>
      <Grid
        container
        item
        xs={12}
        sx={{ padding: 2, height: "calc(100% - 200px)" }}
      >
        <Grid
          item
          xs={6}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 1,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "120%",
              height: "120%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(255, 255, 255, 0.5), transparent 20%)",
              filter: "blur(40px)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          ></Box>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              aspectRatio: "16 / 9",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: 2,
              borderRadius: "8px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <video
              ref={videoRef}
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "8px",
                boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.3)",
              }}
              src={finalUrl}
            ></video>
          </Box>
        </Grid>

        <Grid item xs={3} sx={{ padding: 1 }}>
          <Box
            sx={{
              backgroundColor: "#202020",
              borderRadius: "8px",
              overflowY: "auto",
              height: "100%",
              padding: 1,
            }}
          >
            <List dense>
              <ListItem>
                <ListItemText
                  primary="00:00:05 - 00:00:10"
                  secondary="Subtitle line 1"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="00:00:11 - 00:00:15"
                  secondary="Subtitle line 2"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="00:00:16 - 00:00:20"
                  secondary="Subtitle line 3"
                />
              </ListItem>
            </List>
          </Box>
        </Grid>

        <Grid item xs={3} sx={{ padding: 1 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              backgroundColor: "#202020",
              borderRadius: "8px",
              padding: 2,
            }}
          >
            <Button variant="contained" color="primary" fullWidth>
              Back to Project
            </Button>
            <Button variant="contained" color="secondary" fullWidth>
              Upload Subtitles
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          height: "200px",
          backgroundColor: "#181818",
          padding: 1,
          borderTop: "1px solid #333",
        }}
      >
        <WaveformTimeline videoRef={videoRef} />
      </Grid>
    </Grid>
  );
};

export default Editor;
