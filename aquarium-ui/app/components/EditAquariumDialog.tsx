"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { updateAquarium } from "../store/aquariumsSlice";
import type { AppDispatch } from "../store/store";
import type { Aquarium } from "../types";
import { useState } from "react";

interface EditAquariumDialogProps {
  open: boolean;
  onClose: () => void;
  aquarium: Aquarium;
}

export default function EditAquariumDialog({
  open,
  onClose,
  aquarium,
}: EditAquariumDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [name, setName] = useState(aquarium.name);
  const [description, setDescription] = useState(aquarium.description || "");
  const [gallons, setGallons] = useState(aquarium.gallons?.toString() || "");
  const [dimensions, setDimensions] = useState(aquarium.dimensions || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await dispatch(
        updateAquarium({
          id: aquarium.id,
          name,
          description: description || undefined,
          gallons: gallons ? parseInt(gallons, 10) : undefined,
          dimensions: dimensions || undefined,
        })
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit {aquarium.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Gallons"
              value={gallons}
              onChange={(e) => setGallons(e.target.value)}
              type="number"
              fullWidth
            />
            <TextField
              label="Dimensions"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g., 48x24x24"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );