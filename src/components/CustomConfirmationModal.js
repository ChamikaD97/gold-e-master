import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

export default function CustomConfirmationModal({
  open,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Yes",
  cancelText = "Cancel",
  onConfirm,
  onCancel
}) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1e1e1e",
          color: "#fff",
          borderRadius: 2,
          boxShadow: "0px 0px 20px rgba(0,0,0,0.6)"
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", color: "#fff" }}>
        {title}
      </DialogTitle>

      <DialogContent>
        <Typography sx={{ color: "#bbb" }}>{message}</Typography>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: "#888",
            color: "#ccc",
            "&:hover": {
              borderColor: "#aaa",
              backgroundColor: "rgba(255,255,255,0.08)"
            }
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: "#d32f2f",
            color: "#fff",
            "&:hover": { backgroundColor: "#b71c1c" }
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
