import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Modal,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Select,
  MenuItem,
  CardMedia,
} from "@mui/material";
import { Link } from "react-router-dom";
import ISO6391 from "iso-639-1";
import { backendApi } from "../utils/api";
import { useDispatch } from "react-redux";
import { updateVariable } from "../redux/variables/myVariableSlice";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnails, setThumbnails] = useState({});

  const dispatch = useDispatch();

  const UpdateVideoURL = (url) => {
    dispatch(updateVariable(url));
  };
  const [newProject, setNewProject] = useState({
    title: "",
    commons_url: "",
    language: "en",
  });
  const [isCreating, setIsCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const supportedLanguages = [
    "as",
    "bn",
    "en",
    "gu",
    "hi",
    "kn",
    "kok",
    "ml",
    "mr",
    "ne",
    "or",
    "pa",
    "sa",
    "sd",
    "ta",
    "te",
    "ur",
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchThumbnail = async (url) => {
    const match = url.match(/^https:\/\/commons\.wikimedia\.org\/wiki\/(.+)$/);
    if (!match) {
      return "";
    }

    const pageTitle = decodeURI(match[1]);
    try {
      const response = await axios.get("https://commons.wikimedia.org/w/api.php", {
        params: {
          action: "query",
          format: "json",
          titles: `${pageTitle}`,
          prop: "imageinfo",
          iiprop: "url",
          iiurlwidth: 650,
          origin: "*",
        },
      });

      const pages = response.data.query.pages;
      const page = Object.values(pages)[0]; // Get the first page (or the only one)
      return page.imageinfo ? page.imageinfo[0].thumburl : "";
    } catch (error) {
      console.error("Error fetching thumbnail:", error);
      return "";
    }
  };
  useEffect(() => {
    const loadThumbnails = async () => {
      const urls = {};
      for (const project of projects) {
        if (project.video_url) {
          urls[project.id] = await fetchThumbnail(project.video_url);
        }
      }
      setThumbnails(urls);
    };

    loadThumbnails();
  }, [projects]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await backendApi.get("/api/project");
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!(await validateFields())) return;

    setIsCreating(true);
    try {
      await backendApi.post("/api/project", newProject);
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateFields = async () => {
    const newErrors = {};
    const commonsRegex = /^https:\/\/commons\.wikimedia\.org\/wiki\/.+$/;

    if (!newProject.title.trim()) {
      newErrors.title = "Title is required.";
    }

    if (!newProject.commons_url.trim()) {
      newErrors.commons_url = "Commons File Page URL is required.";
    } else if (!commonsRegex.test(newProject.commons_url)) {
      newErrors.commons_url = "Must be a valid Wikimedia Commons page URL.";
    } else if (!(await isValidCommonsPage(newProject.commons_url))) {
      newErrors.commons_url = "The Wikimedia Commons page does not exist.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const isValidCommonsPage = async (url) => {
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
          UpdateVideoURL(url);
          return true
        }
      }
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };

  return (
    <Container>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress size={40} />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Typography variant="h5">Your Projects</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Create Project
            </Button>
          </Box>

          {/* Projects List */}
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Box
                  component={Link}
                  to={`/editor/${project.id}`}
                  sx={{
                    textDecoration: "none",
                    display: "block",
                  }}
                >
                  <Card
                    sx={{
                      color: "inherit",
                      border: "1px solid rgba(0, 0, 0, 0.12)",
                      boxShadow:
                        "0px 4px 8px rgba(0, 0, 0, 0.15), 0px -4px 8px rgba(0, 0, 0, 0.15)",
                      transition: "box-shadow 0.3s ease, transform 0.3s ease",
                      "&:hover": {
                        boxShadow:
                          "0px 8px 16px rgba(0, 0, 0, 0.2), 0px -8px 16px rgba(0, 0, 0, 0.2)",
                        transform: "scale(1.02)",
                      },
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={thumbnails[project.id]}
                      alt={project.title}
                    />
                    <CardContent>
                      <Typography variant="h6">{project.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Language: {ISO6391.getNativeName(project.language) || project.language}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Create Project Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" marginBottom={2}>
            Create New Project
          </Typography>
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            value={newProject.title}
            onChange={handleInputChange}
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            label="Commons File Page URL"
            name="commons_url"
            fullWidth
            margin="normal"
            value={newProject.commons_url}
            onChange={handleInputChange}
            error={!!errors.commons_url}
            helperText={errors.commons_url}
          />
          <Select
            name="language"
            value={newProject.language}
            onChange={handleInputChange}
            fullWidth
            sx={{ marginTop: 2 }}
          >
            {supportedLanguages.map((lng) => (
              <MenuItem key={lng} value={lng}>
                {ISO6391.getNativeName(lng) || lng}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="error">
            {errors.language}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateProject}
              disabled={isCreating}
            >
              {isCreating ? <CircularProgress size={20} /> : "Create"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default Projects;
