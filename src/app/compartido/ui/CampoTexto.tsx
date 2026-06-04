import { useState } from "react";
import { TextField, InputAdornment, IconButton, TextFieldProps } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type CampoTextoProps = TextFieldProps & {
  icono?: React.ReactNode;
};

export const CampoTexto = ({ icono, type, slotProps, ...props }: CampoTextoProps) => {
  const [mostrarClave, setMostrarClave] = useState(false);
  const esClave = type === "password";
  const tipoFinal = esClave && mostrarClave ? "text" : type;

  return (
    <TextField
      type={tipoFinal}
      fullWidth
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2.5,
          minHeight: 52,
          fontSize: "0.95rem",
        },
      }}
      slotProps={{
        ...slotProps,
        input: {
          startAdornment: icono ? (
            <InputAdornment position="start">{icono}</InputAdornment>
          ) : undefined,
          endAdornment: esClave ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => setMostrarClave((v) => !v)}
                edge="end"
                tabIndex={-1}
              >
                {mostrarClave ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
          ...((slotProps as any)?.input ?? {}),
        },
      }}
      {...props}
    />
  );
};
