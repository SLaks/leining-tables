import { Button, CircularProgress } from "@suid/material";
import { createSignal } from "solid-js";

export function AsyncButton(props: {
  action: () => Promise<void>;
  children: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = createSignal(false);

  return (
    <Button
      variant="contained"
      onClick={() => {
        setLoading(true);
        props.action().finally(() => setLoading(false));
      }}
      disabled={loading() || props.disabled}
      sx={{gap: 2}}
    >
      {loading() && <CircularProgress color="secondary" size={24} />}
      {props.children}
    </Button>
  );
}
