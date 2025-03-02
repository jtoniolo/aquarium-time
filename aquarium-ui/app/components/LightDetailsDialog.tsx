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

export default function LightDetailsDialog({
  open,
  onClose,
  light,
}: LightDetailsDialogProps) {
  const { entity_data: { attributes, state } } = light;

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
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {attributes.friendly_name || light.entity_id}
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
          
          {attributes.ip_address && (
            <ListItem>
              <ListItemText 
                primary="IP Address"
                secondary={attributes.ip_address.toString()}
              />
            </ListItem>
          )}

          {attributes.supported_color_modes && (
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
                    {attributes.supported_color_modes.map((mode) => (
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

          {(attributes.min_color_temp_kelvin || attributes.max_color_temp_kelvin) && (
            <ListItem>
              <ListItemText 
                primary="Color Temperature Range"
                secondary={`${attributes.min_color_temp_kelvin}K - ${attributes.max_color_temp_kelvin}K`}
              />
            </ListItem>
          )}

          {attributes.effect_list && attributes.effect_list.length > 0 && (
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
                    {attributes.effect_list.map((effect) => (
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