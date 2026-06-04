import { Button, ButtonProps, CircularProgress } from "@mui/material";

type BotonPrincipalProps = ButtonProps & {
  cargando?: boolean;
};

export const BotonPrincipal = ({
  cargando,
  children,
  disabled,
  ...props
}: BotonPrincipalProps) => (
  <Button
    type="submit"
    variant="contained"
    fullWidth
    disabled={cargando || disabled}
    sx={{
      py: 1.6,
      borderRadius: 2.5,
      fontWeight: 700,
      fontSize: "0.95rem",
      textTransform: "none",
    }}
    {...props}
  >
    {cargando ? <CircularProgress size={22} color="inherit" /> : children}
  </Button>
);
