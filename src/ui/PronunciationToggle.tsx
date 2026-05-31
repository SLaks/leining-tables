import { type Component } from "solid-js";
import { ToggleButtonGroup, ToggleButton } from "@suid/material";

interface PronunciationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export const PronunciationToggle: Component<PronunciationToggleProps> = (props) => {
  return (
    <ToggleButtonGroup
      color="primary"
      value={props.value}
      exclusive
      onChange={(event, value) => {
        if (value !== null) {
          props.onChange(value);
        }
      }}
      fullWidth
    >
      <ToggleButton value={false}>אשכנזי</ToggleButton>
      <ToggleButton value={true}>ספרדי</ToggleButton>
    </ToggleButtonGroup>
  );
};
