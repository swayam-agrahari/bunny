import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useTranslation, Trans } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography
            variant="body2"
            color="inherit"
            sx={{ flexGrow: 1, textAlign: "center" }}
          >
            &copy; {new Date().getFullYear()} {t("bunny-title")}.{" "}
            <Trans
              i18nKey="bunny-source-code"
              values={{ github: t("bunny-github") }}
              components={[
                <Link
                  key="github-link"
                  href="https://github.com/Jayprakash-SE/bunny"
                  target="_blank"
                  color="inherit"
                  underline="always"
                />
              ]}
            />{" "}
            ({t('bunny-license')}).
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Footer;