import { FormControlLabel, Switch, Typography } from "@mui/material";

interface CampoSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: "small" | "medium";
}

export const CampoSwitch = ({ label, checked, onChange, size = "medium" }: CampoSwitchProps) => (
  <FormControlLabel
    control={
      <Switch
        size={size}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
      />
    }
    label={
      <Typography variant={size === "small" ? "caption" : "body2"} fontWeight={500}>
        {label}
      </Typography>
    }
  />
);
