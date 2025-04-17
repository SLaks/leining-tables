import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  ListItemText,
} from "@suid/material";
import { For } from "solid-js";

export default function CheckableOptions<T extends string>(props: {
  options: Record<T, boolean>;
  setOptions: (options: Record<T, boolean>) => void;
  titles: Record<T, string>;
}) {
  return (
    <List>
      <For each={Object.entries(props.titles) as [T, string][]}>
        {([key, title]) => {
          const labelId = `checkbox-list-label-${key}`;
          return (
            <ListItem disablePadding>
              <ListItemButton
                role={undefined}
                onClick={() =>
                  props.setOptions({
                    ...props.options,
                    [key]: !props.options[key],
                  })
                }
                dense
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={props.options[key]}
                    tabIndex={-1}
                    disableRipple
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={title} />
              </ListItemButton>
            </ListItem>
          );
        }}
      </For>
    </List>
  );
}
