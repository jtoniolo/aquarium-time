"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { assignLight } from "../store/lightsSlice";
import type { RootState, AppDispatch } from "../store/store";
import type { Light } from "../types";
import { useState } from "react";

interface AssignLightDialogProps {
  open: boolean;
  onClose: () => void;
  light: Light;
}

export default function AssignLightDialog({
  open,
  onClose,
  light,
}: AssignLightDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: aquariums } = useSelector(
    (state: RootState) => state.aquariums
  );
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (aquariumId: string) => {
    setAssigning(true);
    try {
      await dispatch(assignLight({ entityId: light.entity_id, aquariumId }));
      onClose();
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Light to Aquarium</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" gutterBottom>
          Select an aquarium to add &quot;
          {light.entity_data?.attributes?.friendly_name || light.entity_id}
          &quot;
        </Typography>
        <List>
          {aquariums.map((aquarium) => (
            <ListItem key={aquarium.id} disablePadding>
              <ListItemButton
                onClick={() => handleAssign(aquarium.id)}
                disabled={assigning}
              >
                <ListItemText
                  primary={aquarium.name}
                  secondary={`${
                    aquarium.gallons ? `${aquarium.gallons} gallons • ` : ""
                  }${aquarium.lights?.length || 0} lights`}
                />
                {assigning && <CircularProgress size={20} sx={{ ml: 1 }} />}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={assigning}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
