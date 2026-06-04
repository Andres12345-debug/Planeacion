import React from "react";
import { Card, CardContent, Box, Typography, Divider } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";

interface CardSistemaProps {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  media?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  elevation?: number;
  hoverable?: boolean;
}

export default function CardSistema({
  icon,
  title,
  description,
  media,
  children,
  actions,
  onClick,
  sx,
  elevation = 0,
  hoverable = true,
}: CardSistemaProps) {
  return (
    <Card
      onClick={onClick}
      elevation={elevation}
      sx={{
        bgcolor: (theme) => (theme.palette.mode === "dark" ? "grey.800" : "grey.300"),
        width: { xs: "100%", sm: "30%" },
        minWidth: 250,
        textAlign: "center",
        p: 2,
        cursor: onClick ? "pointer" : "default",
        borderRadius: 4,
        transition: "transform 0.3s ease, box-shadow 0.25s ease",
        "&:hover": hoverable
          ? {
              transform: onClick ? "rotate(3deg) scale(1.03)" : "translateY(-6px)",
            }
          : undefined,
        ...((sx as any) || {}),
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {media && <Box sx={{ mb: 1 }}>{media}</Box>}

        {icon && (
          <Box
            sx={{
              mb: 1,
              transition: "transform .35s ease",
              ".MuiCard-root:hover &": {
                transform: onClick ? "rotate(10deg) scale(1.2)" : undefined,
              },
            }}
          >
            {icon}
          </Box>
        )}

        {title && (
          <Typography variant="h6" sx={{ mb: 1 }}>
            {title}
          </Typography>
        )}

        {title && <Divider sx={{ mb: 1 }} />}

        {description && <Typography variant="body2">{description}</Typography>}

        {children}
      </CardContent>

      {actions && <Box sx={{ px: 2, py: 1.25 }}>{actions}</Box>}
    </Card>
  );
}
