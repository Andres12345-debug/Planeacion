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

// Styled expand button (prevenir prop `expand` al DOM)
const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }: { theme?: any; expand?: boolean }) => ({
  marginLeft: "auto",
  transform: expand ? "rotate(180deg)" : "rotate(0deg)",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

// Small reusable placeholder image (you can replace)
const FALLBACK_IMAGE = "https://picsum.photos/800/450?blur=2";

/**
 * SingleCard: tarjeta independiente y configurable
 */
function SingleCard({
  item,
  onClick,
}: {
  item: CardItem;
  onClick?: (item: CardItem) => void;
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card
      elevation={3}
      sx={{
        width: { xs: "100%", sm: 340 },
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: theme.palette.mode === "dark" ? "grey.900" : "common.white",
        transition: "transform 300ms ease, box-shadow 300ms ease",
        "&:hover": {
          transform: "translateY(-8px) rotate(-0.5deg)",
          boxShadow: 8,
        },
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea
        onClick={() => onClick?.(item)}
        sx={{ display: "block", textAlign: "left" }}
        aria-label={`Abrir ${item.title}`}
      >
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: "primary.main" }}>
              {item.avatarLetter ?? item.title?.[0]?.toUpperCase() ?? "A"}
            </Avatar>
          }
          action={
            <Tooltip title="Opciones">
              <IconButton aria-label={`Opciones de ${item.title}`}>
                <MoreVertIcon />
              </IconButton>
            </Tooltip>
          }
          title={
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.1 }}
            >
              {item.title}
            </Typography>
          }
          subheader={
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {item.date ?? "Fecha no disponible"}
            </Typography>
          }
        />

        <CardMedia
          component="img"
          image={item.image ?? FALLBACK_IMAGE}
          alt={item.title}
          height="194"
          loading="lazy"
          sx={{
            width: "100%",
            height: 194,
            objectFit: "cover",
            display: "block",
          }}
        />

        <CardContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {item.excerpt ??
              "Aquí va una descripción breve que resuma el contenido de la tarjeta."}
          </Typography>
        </CardContent>
      </CardActionArea>

      <Box sx={{ flexGrow: 1 }} />

      <CardActions disableSpacing sx={{ px: 2 }}>
        <Tooltip title="Agregar a favoritos">
          <IconButton aria-label={`Guardar ${item.title} como favorito`}>
            <FavoriteIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Compartir">
          <IconButton aria-label={`Compartir ${item.title}`}>
            <ShareIcon />
          </IconButton>
        </Tooltip>

        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded((s) => !s)}
          aria-expanded={expanded}
          aria-label={expanded ? "Cerrar más información" : "Abrir más información"}
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {item.details ??
              "Contenido adicional: aquí puedes ampliar la información relacionada con la tarjeta."}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

/**
 * ThreeCards: contenedor responsivo para un conjunto de tarjetas.
 * Puedes pasar `items` si quieres reutilizarlo con otros datos.
 */
export default function ThreeCards({
  items,
  onCardClick,
}: {
  items?: CardItem[];
  onCardClick?: (item: CardItem) => void;
}) {
  // default items si no se pasan por props
  const defaultItems: CardItem[] = [
    {
      id: 1,
      title: "Card 1",
      date: "Septiembre 2025",
      image: "https://picsum.photos/640/360?random=11",
      excerpt:
        "Este es un texto de ejemplo para la card 1. Aquí puedes agregar la descripción.",
      details:
        "Detalle adicional card 1. Más información, enlaces, o pasos a seguir.",
    },
    {
      id: 2,
      title: "Card 2",
      date: "Septiembre 2025",
      image: "https://picsum.photos/640/360?random=22",
      excerpt:
        "Este es un texto de ejemplo para la card 2. Aquí puedes agregar la descripción.",
      details: "Detalle adicional card 2.",
    },
    {
      id: 3,
      title: "Card 3",
      date: "Septiembre 2025",
      image: "https://picsum.photos/640/360?random=33",
      excerpt:
        "Este es un texto de ejemplo para la card 3. Aquí puedes agregar la descripción.",
      details: "Detalle adicional card 3.",
    },
  ];

  const list = items ?? defaultItems;

  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 2, md: 8 },
        mt: 6,
        display: "flex",
        justifyContent: "center",
      }}
    >
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
        }}
      >
        {list.map((item) => (
          <SingleCard key={item.id} item={item} onClick={onCardClick} />
        ))}
      </Box>
    </Box>
  );
}
