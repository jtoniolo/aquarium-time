"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import { discoverLights } from "../store/lightsSlice";
import { fetchAquariums } from "../store/aquariumsSlice";
import type { RootState, AppDispatch } from "../store/store";
import type { Light } from "../types";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import AddIcon from "@mui/icons-material/Add";
import AssignLightDialog from "../components/AssignLightDialog";

export default function DiscoverPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { discoveredLights, loading } = useSelector(
    (state: RootState) => state.lights
  );
  const { items: aquariums } = useSelector(
    (state: RootState) => state.aquariums
  );
  const [selectedLight, setSelectedLight] = useState<Light | null>(null);

  useEffect(() => {
    if (aquariums.length === 0) {
      dispatch(fetchAquariums());
    }
  }, [dispatch, aquariums.length]);

  useEffect(() => {
    if (aquariums.length > 0) {
      dispatch(discoverLights());
    }
  }, [dispatch, aquariums.length]);

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
        <LightbulbIcon sx={{ fontSize: 60, color: "text.secondary" }} />
        <Typography variant="h5" gutterBottom>
          Add an Aquarium First
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          You need to create at least one aquarium before discovering lights.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/")}
        >
          Add Aquarium
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box>
        <Typography variant="h5" gutterBottom>
          Discover Lights
        </Typography>
        <Grid container spacing={3}>
          {discoveredLights.map((light: Light) => (
            <Grid item xs={12} md={6} lg={4} key={light.entity_id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {light.entity_data?.attributes?.friendly_name ||
                      light.entity_id}
                  </Typography>
                  <Typography color="text.secondary">
                    {light.entity_data?.state || "Unknown"}
                  </Typography>
                  {light.entity_data?.attributes?.supported_color_modes && (
                    <Typography variant="body2" color="text.secondary">
                      Supports:{" "}
                      {light.entity_data.attributes.supported_color_modes.join(
                        ", "
                      )}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => setSelectedLight(light)}
                    startIcon={<AddIcon />}
                  >
                    Add to Aquarium
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {selectedLight && (
        <AssignLightDialog
          open={Boolean(selectedLight)}
          onClose={() => setSelectedLight(null)}
          light={selectedLight}
        />
      )}
    </>
  );
}
