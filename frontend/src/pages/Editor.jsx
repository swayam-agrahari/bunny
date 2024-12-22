import { useRef, useEffect, useState } from "react";
import {
  Grid,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Modal,
  Typography,
  IconButton,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import WaveformTimeline from "../components/WaveformTimeline";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { backendApi } from "../utils/api";
import { useNavigate } from "react-router-dom";
import SRTParser2 from "srt-parser-2";


const Editor = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const variable = useSelector((state) => state.myVariable.value);
  const [finalUrl, setFinalUrl] = useState(variable);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const fetchProjectAndSubtitles = async () => {
      const id = getLastEditorId();
      try {
        const projectResponse = await backendApi.get(`/api/project/${id}`);
        const { title, video_url, language } = projectResponse.data;

        // Get video URL from Wikimedia if needed
        const videoUrlResponse = await getUrl(video_url);
        if (videoUrlResponse !== false) {
          setFinalUrl(videoUrlResponse);
        }

        // Then fetch subtitles if we have a title
        if (title) {
          try {
            const subtitlesResponse = await backendApi.get('/api/timed-text', {
              params: {
                title: title,
                language: language || 'en'
              }
            });

            if (subtitlesResponse.data && subtitlesResponse.data.subtitles) {
              // Parse the SRT content
              const parser = new SRTParser2();
              const parsedSubtitles = parser.fromSrt(subtitlesResponse.data.subtitles);

              // Convert to your subtitle format
              const formattedSubtitles = parsedSubtitles.map(sub => ({
                start: timeToSeconds(sub.startTime),
                end: timeToSeconds(sub.endTime),
                text: sub.text
              }));

              // Update subtitles state if we got valid subtitles
              if (formattedSubtitles.length > 0) {
                setSubtitles(formattedSubtitles);
              }
            }
          } catch (subtitleError) {
            console.error("Error fetching subtitles:", subtitleError);
            // Keep default subtitles if subtitle fetch fails
          }
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
      }
    };

    fetchProjectAndSubtitles();
  }, []);

  // Define the subtitles with their timestamps
  const [subtitles, setSubtitles] = useState([
    { start: 5, end: 10, text: "Subtitle line 1" },
    { start: 11, end: 15, text: "Subtitle line 2" },
    { start: 16, end: 20, text: "Subtitle line 3" },
  ]);

  const getVideoDetails = async () => {
    const id = getLastEditorId();
    try {
      const response = await backendApi.get(`/api/project/${id}`);
      const { video_url } = response.data;
      const response2 = await getUrl(video_url);
      if (response2 !== false) {
        setFinalUrl(response2);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const getLastEditorId = () => {
    const segments = location.pathname.split("/");
    console.log("segemts", segments)
    return segments[segments.length - 1];
  };

  const getUrl = async (url) => {
    try {
      if (!url.includes('commons.wikimedia.org')) {
        return false;
      }
      const match = url.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/(.+)$/);
      if (!match) {
        return false;
      }

      const pageTitle = decodeURI(match[1]); // Ensure the title is decoded properly
      const params = {
        action: "query",
        format: "json",
        prop: "videoinfo",
        titles: pageTitle,
        viprop: "user|url|canonicaltitle|comment|url",
        origin: "*",
      };

      const res = await fetch(`https://commons.wikimedia.org/w/api.php?${new URLSearchParams(params)}`);
      const response = await res.json();
      const { pages } = response.query;

      if (Object.keys(pages)[0] !== '-1') {
        const { url } = pages[Object.keys(pages)[0]].videoinfo[0];
        if (url.length > 0) {
          return url;
        }
      }
      return false;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };



  useEffect(() => {
    getVideoDetails();
  }, []);

  const formatVTTTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  useEffect(() => {
    if (!videoRef.current) return;

    // Remove any existing tracks
    const existingTracks = videoRef.current.getElementsByTagName('track');
    while (existingTracks.length > 0) {
      videoRef.current.removeChild(existingTracks[0]);
    }

    // Create WebVTT content
    const vttContent = `WEBVTT\n\n${subtitles
      .map((sub, index) => {
        const startTime = formatVTTTime(sub.start);
        const endTime = formatVTTTime(sub.end);
        return `${index + 1}\n${startTime} --> ${endTime}\n${sub.text}\n`;
      })
      .join('\n')}`;

    // Create blob and URL
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    const subtitleUrl = URL.createObjectURL(blob);

    // Create and append track element
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'English';
    track.srclang = 'en';
    track.src = subtitleUrl;
    track.default = true;

    videoRef.current.appendChild(track);

    // Cleanup
    return () => {
      URL.revokeObjectURL(subtitleUrl);
    };
  }, [subtitles]); // Dependency on subtitles array



  // Handle subtitle click, seek the video to the specific time
  const handleSubtitleClick = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
    }
  };

  // Handle adding new subtitle
  const handleSubtitleAdd = (newSubtitle) => {
    setSubtitles((prev) => [...prev, newSubtitle].sort((a, b) => a.start - b.start));
  };

  // Handle deleting subtitle
  const handleSubtitleDelete = (index) => {
    setSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle edit start
  const handleEditStart = (subtitle, index) => {
    setEditingIndex(index);
    setEditText(subtitle.text);
  };

  // Handle edit save
  const handleEditSave = (index) => {
    if (editText.trim()) {
      setSubtitles(prev => prev.map((sub, i) =>
        i === index ? { ...sub, text: editText } : sub
      ));
    }
    setEditingIndex(null);
    setEditText("");
  };

  // Handle key press during edit
  const handleKeyPress = (e, index) => {
    if (e.key === 'Enter') {
      handleEditSave(index);
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditText("");
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parser = new SRTParser2();
        let parsedSubtitles = parser.fromSrt(content, true);
        parsedSubtitles = parsedSubtitles.map((subtitle) => ({
          start: timeToSeconds(subtitle.startTime),
          end: timeToSeconds(subtitle.endTime),
          text: subtitle.text,
        }));

        setSubtitles(parsedSubtitles);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Error parsing SRT file:", error);
        alert("Failed to parse SRT file. Please check the file format.");
      }
    };
    reader.readAsText(file);



  };

  const secondsToSrtTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(milliseconds).padStart(3, '0')}`;
  };

  // Convert subtitles array to SRT format
  const convertToSrt = (subtitles) => {
    return subtitles
      .map((subtitle, index) => {
        return `${index + 1}\n${secondsToSrtTime(subtitle.start)} --> ${secondsToSrtTime(subtitle.end)}\n${subtitle.text}\n`;
      })
      .join('\n');
  };

  // Add this function inside the Editor component
  function handleDownload() {
    // Convert subtitles to SRT format
    const srtContent = convertToSrt(subtitles);

    // Create blob with SRT content
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });

    // Create temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);

    // Set filename
    const videoName = finalUrl.split('/').pop().split('.')[0] || 'subtitles';
    link.download = `${videoName}.srt`;

    // Append link to document, click it, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
  };
  return (
    <Grid container sx={{ height: "100vh", backgroundColor: "#121212" }}>
      <Grid container item xs={12} sx={{ padding: 2, height: "calc(100% - 200px)" }}>
        <Grid item xs={6} sx={{ padding: 1 }}>
          <Box sx={{ width: "100%", aspectRatio: "16 / 9" }}>
            <video
              ref={videoRef}
              controls
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
                boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.3)",
              }}
              src={finalUrl}
            />
          </Box>
        </Grid>

        <Grid item xs={3} sx={{ padding: 1 }}>
          <Box
            sx={{
              backgroundColor: "#202020",
              borderRadius: "8px",
              maxHeight: "600px",
              overflowY: "auto",
              padding: 1,
            }}
          >
            <List dense>
              {subtitles.map((subtitle, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleSubtitleDelete(index)}
                      sx={{ color: "white" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    sx={{ color: "#808080", cursor: "pointer", width: "100%" }}
                    primary={`${formatTime(subtitle.start)} - ${formatTime(subtitle.end)}`}
                    secondary={
                      editingIndex === index ? (
                        <TextField
                          fullWidth
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onBlur={() => handleEditSave(index)}
                          onKeyDown={(e) => handleKeyPress(e, index)}
                          size="small"
                          sx={{
                            '& .MuiInputBase-input': {
                              color: '#fff',
                            },
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': {
                                borderColor: '#404040',
                              },
                              '&:hover fieldset': {
                                borderColor: '#606060',
                              },
                            },
                          }}
                        />
                      ) : (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(subtitle, index);
                          }}
                          style={{
                            cursor: 'pointer',
                            color: "#dee2e6"
                          }}
                        >
                          {subtitle.text}
                        </span>
                      )
                    }
                    onClick={() => handleSubtitleClick(subtitle.start)}
                  />
                </ListItem>
              ))}
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
            <Button onClick={() => navigate("/projects")} variant="contained" color="primary" fullWidth>
              Back to Project
            </Button>
            <Button variant="contained" color="secondary" fullWidth onClick={() => setIsModalOpen(true)}>
              Upload Subtitles
            </Button>
            <Button variant="contained" color="secondary" fullWidth onClick={handleDownload}>
              Download Subtitles
            </Button>
            <Button variant="contained" color="secondary" fullWidth>
              Upload to Commons
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
        <WaveformTimeline
          videoRef={videoRef}
          subtitles={subtitles}
          onSubtitleAdd={handleSubtitleAdd}
          onSubtitleDelete={handleSubtitleDelete}
        />
      </Grid>

      {/* Upload Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upload Subtitles
          </Typography>
          <Button variant="contained" component="label" fullWidth>
            Select SRT File
            <input type="file" accept=".srt" hidden onChange={handleFileUpload} />
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
};

// Helper function to format time in minutes:seconds format
const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(":");
  const [sec, ms] = seconds.split(",");
  return (
    parseInt(hours, 10) * 3600 +
    parseInt(minutes, 10) * 60 +
    parseInt(sec, 10) +
    parseInt(ms, 10) / 1000
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};



export default Editor;