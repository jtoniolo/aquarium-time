'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Typography, Card, CardContent, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fetchAquariums } from './store/aquariumsSlice';
import type { RootState, AppDispatch } from './store/store';
import type { Aquarium } from './types';
import AddAquariumDialog from './components/AddAquariumDialog';
import TimeOfDay from './components/TimeOfDay';

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: aquariums, loading } = useSelector((state: RootState) => state.aquariums);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAquariums());
  }, [dispatch]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (aquariums.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="50vh"
        gap={2}
      >
        <Typography variant="h5" gutterBottom>
          Welcome to Aquarium Sun
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Get started by adding your first aquarium.
          Once you have an aquarium set up, you can discover and assign lights to it.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setDialogOpen(true)}
        >
          Add Aquarium
        </Button>
        <AddAquariumDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      </Box>
    );
  }

  return (
    <Box>
      <TimeOfDay />
      
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Aquariums
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Aquarium
        </Button>
      </Box>

      <Grid container spacing={3}>
        {aquariums.map((aquarium: Aquarium) => (
          <Grid item xs={12} md={6} lg={4} key={aquarium.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {aquarium.name}
                </Typography>
                {aquarium.description && (
                  <Typography color="text.secondary" gutterBottom>
                    {aquarium.description}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {aquarium.gallons && `${aquarium.gallons} gallons`}
                  {aquarium.dimensions && ` • ${aquarium.dimensions}`}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {aquarium.lights?.length || 0} lights assigned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} md={6} lg={4}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              cursor: 'pointer',
            }}
            onClick={() => setDialogOpen(true)}
          >
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ p: 2 }}
            >
              Add Another Aquarium
            </Button>
          </Card>
        </Grid>
      </Grid>
      <AddAquariumDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
