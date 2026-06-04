import { Box } from "@mui/material";
import ImageCarousel from "../componentes/ImageCarousel";
import InfoSection from "../componentes/infoSection";
import FeatureCardsFlex from "../componentes/Features";
import Allies from "../componentes/Allies";
import FaqSection from "../componentes/Faqs";
import ThankYouSection from "../componentes/ThankYouSection";

export const Welcome = () => {
  return (
    <Box>
      <ImageCarousel />
      <Box
      >
        <InfoSection />
        <FeatureCardsFlex />
        <Allies />
      </Box>
      <FaqSection></FaqSection>
      <ThankYouSection />
    </Box>
  );
};
export default Welcome;
