import { Box } from "@mui/material";
import ImageCarousel from "../componentes/ImageCarousel";
import InfoSection from "../componentes/infoSection";
import FeatureCardsFlex from "../componentes/Features";
import Allies from "../componentes/Allies";
import FaqSection from "../componentes/Faqs";
import ExpandMoreProps from "../componentes/ExpandMoreProps";
import ThankYouSection from "../componentes/ThankYouSection";

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
      <Box sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? "#e7e7e7b5"
            : "#0d1117",
        transition: "background-color .3s ease",
      }}>
        <ExpandMoreProps />
        <ThankYouSection />
      </Box>
    </Box>
  );
};
export default Welcome;
