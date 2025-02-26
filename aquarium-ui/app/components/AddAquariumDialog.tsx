'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { createAquarium } from '../store/aquariumsSlice';
import type { AppDispatch } from '../store/store';

interface AddAquariumDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddAquariumDialog({ open, onClose }: AddAquariumDialogProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gallons: '',
    dimensions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createAquarium({
      ...formData,
      gallons: formData.gallons ? parseFloat(formData.gallons) : undefined,
    }));
    onClose();
    setFormData({ name: '', description: '', gallons: '', dimensions: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add New Aquarium</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              label="Volume (gallons)"
              type="number"
              value={formData.gallons}
              onChange={(e) => setFormData({ ...formData, gallons: e.target.value })}
            />
            <TextField
              label="Dimensions (LxWxH)"
              placeholder="e.g., 48x13x21"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={!formData.name}>
            Add Aquarium
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}