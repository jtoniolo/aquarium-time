"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
} from "@mui/material";
import type { Light } from "../types";

interface LightDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  light: Light;
}

type LightAttributes = {
  friendly_name?: string;
  ip_address?: string;
  supported_color_modes?: string[];
  min_color_temp_kelvin?: number;
  max_color_temp_kelvin?: number;
  effect_list?: string[];
};

export default function LightDetailsDialog({
  open,
  onClose,
  light,
}: LightDetailsDialogProps) {
  const { entity_data: { attributes, state } } = light;
  const attrs = attributes as LightAttributes;
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {attrs.friendly_name || light.entity_id}
      </DialogTitle>
      <DialogContent>
        <List>
          <ListItem>
            <ListItemText 
              primary="Status"
              secondary={
                <Stack direction="row" sx={{ mt: 1 }}>
                  <Chip 
                    label={state?.toString() || 'Unknown'}
                    size="small"
                    color={getStatusColor(state?.toString() || '')}
                  />
                </Stack>
              }
            />
          </ListItem>
          
          {attrs.ip_address && (
            <ListItem>
              <ListItemText 
                primary="IP Address"
                secondary={attrs.ip_address}
              />
            </ListItem>
          )}

          {attrs.supported_color_modes && attrs.supported_color_modes.length > 0 && (
            <ListItem>
              <ListItemText 
                primary="Supported Color Modes"
                secondary={
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      mt: 1,
                      gap: "8px",
                      rowGap: "8px",
                      flexWrap: "wrap"
                    }}
                  >
                    {attrs.supported_color_modes.map((mode) => (
                      <Chip 
                        key={mode} 
                        label={mode} 
                        size="small"
                      />
                    ))}
                  </Stack>
                }
              />
            </ListItem>
          )}

          {(attrs.min_color_temp_kelvin || attrs.max_color_temp_kelvin) && (
            <ListItem>
              <ListItemText 
                primary="Color Temperature Range"
                secondary={`${attrs.min_color_temp_kelvin}K - ${attrs.max_color_temp_kelvin}K`}
              />
            </ListItem>
          )}

          {attrs.effect_list && attrs.effect_list.length > 0 && (
            <ListItem>
              <ListItemText 
                primary="Available Effects"
                secondary={
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      mt: 1,
                      gap: "8px",
                      rowGap: "8px",
                      flexWrap: "wrap"
                    }}
                  >
                    {attrs.effect_list.map((effect) => (
                      <Chip 
                        key={effect} 
                        label={effect} 
                        size="small"
                      />
                    ))}
                  </Stack>
                }
              />
            </ListItem>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'on':
      return 'success';
    case 'off':
      return 'default';
    case 'unavailable':
      return 'error';
    default:
      return 'default';
  }
};