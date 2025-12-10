// src/components/ThreeCards.tsx
import * as React from "react";
import {
  styled,
  useTheme,
  Box,
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActions,
  Collapse,
  Avatar,
  IconButton,
  Typography,
  CardActionArea,
  Tooltip,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// ⭐ IMPORTA AQUÍ TUS IMÁGENES LOCALES
import noticia1 from "../../../assets/img/noticias/tramite7.jpeg";
import noticia2 from "../../../assets/img/noticias/tramite7.jpeg";
import noticia3 from "../../../assets/img/noticias/tramite7.jpeg";

interface CardItem {
  id: string | number;
  title: string;
  date?: string;
  image?: string;
  excerpt?: string;
  details?: string;
  avatarLetter?: string;
}

interface ExpandMoreProps extends React.ComponentProps<typeof IconButton> {
  expand?: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  marginLeft: "auto",
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const FALLBACK_IMAGE = "https://picsum.photos/800/450?blur=2";

function SingleCard({ item, onClick }: { item: CardItem; onClick?: (item: CardItem) => void }) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card
      elevation={3}
      sx={{
        width: { xs: "100%", sm: 340 },
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "white",
        transition: "transform 300ms ease, box-shadow 300ms ease",
        "&:hover": {
          transform: "translateY(-8px) rotate(-0.5deg)",
          boxShadow: 8,
        },
      }}
    >
      <CardActionArea onClick={() => onClick?.(item)} sx={{ display: "block", textAlign: "left" }}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {item.avatarLetter ?? item.title[0]}
            </Avatar>
          }
          action={
            <Tooltip title="Opciones">
              <IconButton>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          }
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {item.title}
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ color: "text.primary" }}>
              {item.date}
            </Typography>
          }
        />

        <CardMedia
          component="img"
          image={item.image ?? FALLBACK_IMAGE}
          alt={item.title}
          height="194"
          loading="lazy"
          sx={{ objectFit: "cover" }}
        />

        <CardContent>
          <Typography variant="body2" sx={{ color: "text.primary" }}>
            {item.excerpt}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions disableSpacing sx={{ px: 2 }}>
        <Tooltip title="Agregar a favoritos">
          <IconButton>
            <FavoriteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Compartir">
          <IconButton>
            <ShareIcon />
          </IconButton>
        </Tooltip>

        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {item.details}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

export default function ThreeCards({
  items,
  onCardClick,
}: {
  items?: CardItem[];
  onCardClick?: (item: CardItem) => void;
}) {
  const defaultItems: CardItem[] = [
    {
      id: 1,
      title: "Alcaldía Tunja",
      date: "18 Febrero, 2025",
      image: noticia1, // ⭐ IMAGEN LOCAL
      excerpt: "Todo lo que necesitas saber sobre la Ventanilla Única de Construcción en Tunja",
      details: "Contenido extendido de la tarjeta 1.",
    },
    {
      id: 2,
      title: "Alcaldía Tunja",
      date: "18 Febrero, 2025",
      image: noticia2, // ⭐ IMAGEN LOCAL
      excerpt: "¿Qué impacto tendrá la VUC-i en el desarrollo urbano de Tunja?",
      details: "Contenido extendido de la tarjeta 2.",
    },
    {
      id: 3,
      title: "Alcaldía Tunja",
      date: "18 Febrero, 2025",
      image: noticia3, // ⭐ IMAGEN LOCAL
      excerpt:
        "Ahorra tiempo y dinero: Ventajas de gestionar tus trámites de construcción en línea con la VUC-i",
      details: "Contenido extendido de la tarjeta 3.",
    },
  ];

  const list = items ?? defaultItems;

  return (
    <Box sx={{ width: "100%", px: { xs: 2, md: 8 } }}>
      {/* 🔥 TÍTULO */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          sx={{
            py: 8,
            fontWeight: 700,
            mb: 2,
          }}
        >
          Noticias
        </Typography>
      </Box>

      {/* CARDS */}
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(3, 1fr)",
          },
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {list.map((item) => (
          <SingleCard key={item.id} item={item} onClick={onCardClick} />
        ))}
      </Box>
    </Box>
  );
}
