import { Container, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { useTranslation } from "react-i18next";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { logged: isLoggedIn } = useSelector((state) => state.auth);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Box
        component="img"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Rabbit_%289123%29_-_The_Noun_Project.svg/480px-Rabbit_%289123%29_-_The_Noun_Project.svg.png"
        sx={{ width: 250, height: 250, marginBottom: 4 }}
      />
      <Typography
        variant="body1"
        component="p"
        color="text.secondary"
        sx={{
          marginBottom: 2,
          padding: 2,
          maxWidth: "600px",
          textAlign: "justify",
        }}
      >
        {t("bunny-desc")}
      </Typography>
      {isLoggedIn ? (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate("/projects")}
        >
          {t("bunny-project-start")}
        </Button>
      ) : (
        <Typography variant="body1" color="error">
          {t("bunny-login-required")}
        </Typography>
      )}
    </Container>
  );
};

export default Home;
