import { Box } from "@mui/material";
import ImageCarousel from "../components/ImageCarousel";
import InfoSection from "../components/infoSection";
import FeatureCardsFlex from "../components/Features";
import Allies from "../components/Allies";
import FaqSection from "../components/Faqs";
import { ExpandMore } from "@mui/icons-material";
import ExpandMoreProps from "../components/ExpandMoreProps";

export const Welcome = () => {
  return (
    <Box>
      <ImageCarousel />
      <Box
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? "#e7e7e7b5"
              : "#0d1117",
          transition: "background-color .3s ease",
        }}
      >
        <InfoSection />
        <FeatureCardsFlex />
        <Allies />
      </Box>
      <FaqSection></FaqSection>
      <ExpandMoreProps />

    </Box>
  );
};
