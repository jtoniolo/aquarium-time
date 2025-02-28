"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import SaveIcon from "@mui/icons-material/Save";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import {
  fetchAquariums,
  deleteAquarium,
  updateAquarium,
} from "../../store/aquariumsSlice";
import { removeLight } from "../../store/lightsSlice";
import { fetchDistributionData } from "../../store/sunSlice";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import LightingConfigSection from "../../components/LightingConfigSection";
import LightDistributionGraph from "../../components/LightDistributionGraph";
import { SunConfig } from "../../types";
import { createSelector } from "@reduxjs/toolkit";

// Create memoized selectors
const selectAquarium = createSelector(
  [
    (state: RootState) => state.aquariums.items,
    (_: RootState, id: string) => id,
  ],
  (aquariums, id) => aquariums.find((a) => a.id === id)
);

const selectDistributionData = createSelector(
  [
    (state: RootState) => state.sun.distributionData,
    (_: RootState, id: string) => id,
  ],
  (distributionData, id) => distributionData[id] || []
);

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onFinishEdit?: () => void;
  multiline?: boolean;
  placeholder?: string;
  isEditing: boolean;
}

function EditableField({
  value,
  onChange,
  onStartEdit,
  onFinishEdit,
  multiline,
  placeholder,
  isEditing,
}: EditableFieldProps) {
  if (!isEditing) {
    return (
      <Box
        onClick={onStartEdit}
        sx={{
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.hover",
            borderRadius: 1,
            px: 1,
            mx: -1,
          },
          minHeight: "1.5em",
          display: "flex",
          alignItems: "center",
          gap: 1,
          py: 0.5,
        }}
      >
        <Typography color={value ? "text.primary" : "text.secondary"}>
          {value || placeholder}
        </Typography>
        <EditRoundedIcon
          sx={{ fontSize: 16, color: "action.active", opacity: 0.5 }}
        />
      </Box>
    );
  }

  return (
    <ClickAwayListener onClickAway={onFinishEdit || (() => {})}>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="standard"
        fullWidth
        multiline={multiline}
        rows={multiline ? 3 : 1}
        placeholder={placeholder}
        autoFocus
        sx={{
          "& .MuiInputBase-root": {
            backgroundColor: "action.hover",
            borderRadius: 1,
            px: 1,
          },
        }}
      />
    </ClickAwayListener>
  );
}

export default function AquariumDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gallons, setGallons] = useState("");
  const [dimensions, setDimensions] = useState("");

  // Use memoized selectors with the id from useParams
  const aquarium = useSelector((state: RootState) => selectAquarium(state, id));
  const distributionData = useSelector((state: RootState) =>
    selectDistributionData(state, id)
  );

  // Update useEffect to use id from useParams
  useEffect(() => {
    if (aquarium) {
      dispatch(
        fetchDistributionData({
          aquariumId: id,
          config: aquarium.lightingConfig,
        })
      );
    }
  }, [dispatch, aquarium, id]);

  // Initialize local state when aquarium data loads
  useEffect(() => {
    if (aquarium) {
      setName(aquarium.name);
      setDescription(aquarium.description || "");
      setGallons(aquarium.gallons?.toString() || "");
      setDimensions(aquarium.dimensions || "");
    }
  }, [aquarium]);

  useEffect(() => {
    dispatch(fetchAquariums());
  }, [dispatch]);

  // Add effect to fetch distribution data
  useEffect(() => {
    if (aquarium) {
      dispatch(
        fetchDistributionData({
          aquariumId: aquarium.id,
          config: aquarium.lightingConfig,
        })
      );
    }
  }, [aquarium, dispatch]);

  // Check if there are any unsaved changes
  const hasChanges =
    aquarium &&
    (name !== aquarium.name ||
      description !== (aquarium.description || "") ||
      gallons !== (aquarium.gallons?.toString() || "") ||
      dimensions !== (aquarium.dimensions || ""));

  const handleSave = async () => {
    if (!aquarium) return;

    await dispatch(
      updateAquarium({
        id: aquarium.id,
        name,
        description: description || undefined,
        gallons: gallons ? parseInt(gallons, 10) : undefined,
        dimensions: dimensions || undefined,
        lightingConfig: aquarium.lightingConfig,
      })
    );
    setEditingField(null);
  };

  const handleLightingConfigChange = (config: SunConfig) => {
    if (!aquarium) return;
    dispatch(
      updateAquarium({
        ...aquarium,
        lightingConfig: config,
      })
    ).then(() => {
      // Fetch new distribution data after config update
      dispatch(fetchDistributionData({ aquariumId: aquarium.id, config }));
    });
  };

  if (!aquarium) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography>Aquarium not found</Typography>
      </Box>
    );
  }

  const handleDelete = async () => {
    await dispatch(deleteAquarium(aquarium.id));
    router.push("/");
  };

  const handleRemoveLight = async (lightId: string) => {
    try {
      await dispatch(removeLight(lightId));
      // Refresh aquarium data to reflect the removed light
      dispatch(fetchAquariums());
    } catch (error) {
      console.error("Failed to remove light:", error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => router.push("/")} size="large">
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <EditableField
            value={name}
            onChange={setName}
            onStartEdit={() => setEditingField("name")}
            onFinishEdit={() => setEditingField(null)}
            isEditing={editingField === "name"}
            placeholder="Enter aquarium name"
          />
        </Box>
        <Button
          startIcon={<SaveIcon />}
          onClick={handleSave}
          variant="contained"
          disabled={!hasChanges}
          sx={{ mr: 1 }}
        >
          Save
        </Button>
        <Button
          startIcon={<DeleteIcon />}
          onClick={() => setConfirmDelete(true)}
          variant="outlined"
          color="error"
        >
          Delete
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Box sx={{ mb: 2 }}>
              <EditableField
                value={description}
                onChange={setDescription}
                onStartEdit={() => setEditingField("description")}
                onFinishEdit={() => setEditingField(null)}
                isEditing={editingField === "description"}
                multiline
                placeholder="Add a description"
              />
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <EditableField
                  value={gallons}
                  onChange={setGallons}
                  onStartEdit={() => setEditingField("gallons")}
                  onFinishEdit={() => setEditingField(null)}
                  isEditing={editingField === "gallons"}
                  placeholder="Add gallons"
                />
              </Grid>
              <Grid item xs={6}>
                <EditableField
                  value={dimensions}
                  onChange={setDimensions}
                  onStartEdit={() => setEditingField("dimensions")}
                  onFinishEdit={() => setEditingField(null)}
                  isEditing={editingField === "dimensions"}
                  placeholder="Add dimensions (e.g., 48x24x24)"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Lights
            </Typography>
            {aquarium.lights && aquarium.lights.length > 0 ? (
              <List>
                {aquarium.lights.map((light) => (
                  <ListItem key={light.entity_id} divider>
                    <ListItemText
                      primary={
                        light.entity_data.attributes.friendly_name ||
                        light.entity_id
                      }
                      secondary={`Status: ${light.entity_data.state}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleRemoveLight(light.entity_id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  py: 3,
                  gap: 2,
                }}
              >
                <LightbulbIcon sx={{ fontSize: 40, color: "text.secondary" }} />
                <Typography color="text.secondary">
                  No lights assigned to this aquarium
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/discover")}
                >
                  Discover Lights
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Lighting Schedule
            </Typography>
            <Box sx={{ mb: 3 }}>
              <LightingConfigSection
                config={aquarium?.lightingConfig}
                onChange={handleLightingConfigChange}
                disabled={!aquarium}
              />
            </Box>
            <Box sx={{ height: 400 }}>
              <LightDistributionGraph data={distributionData} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Delete Aquarium?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {aquarium.name}? This action cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
