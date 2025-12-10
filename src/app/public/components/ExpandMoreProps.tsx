// src/components/ThreeCards.tsx
import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';

interface ExpandMoreProps extends IconButtonProps {
  expand?: boolean;
}

// Usamos shouldForwardProp para evitar que la prop `expand` llegue al DOM
const ExpandMore = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'expand',
})<ExpandMoreProps>(({ theme, expand }) => ({
  marginLeft: 'auto',
  transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

// -------------------------------
// COMPONENTE INDIVIDUAL PARA UNA CARD
// -------------------------------
function SingleCard({ title }: { title: string }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    
    <Card
      sx={{
        // responsive width: full en xs, ~345 en sm+
        width: { xs: '100%', sm: 345 },
        backgroundColor: '#f3f3f3',
        borderRadius: 2,
      }}
    >
      <CardHeader
        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>{title[0]}</Avatar>}
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={title}
        subheader="Septiembre 2025"
      />

      <CardMedia
        component="img"
        height="194"
        image="https://picsum.photos/345/194"
        alt="Demo"
      />

      <CardContent>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Este es un texto de ejemplo para la card "{title}". Aquí puedes agregar
          la descripción que desees.
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton aria-label="add to favorites">
          <FavoriteIcon />
        </IconButton>

        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>

        <ExpandMore
          expand={expanded}
          onClick={() => setExpanded((s) => !s)}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography>
            Este es el contenido adicional de la card "{title}". Aquí puedes
            agregar más texto, detalles o información.
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}

// -------------------------------
// CONTENEDOR DE LAS 3 CARDS
// -------------------------------
export default function ThreeCards() {
  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 2, md: 8 }, // mismo padding que estás usando en otras secciones
        mt: 4,
        display: 'flex',
        gap: 4,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        <SingleCard title="Card 1" />
        <SingleCard title="Card 2" />
        <SingleCard title="Card 3" />
      </Box>
    </Box>
  );
}
