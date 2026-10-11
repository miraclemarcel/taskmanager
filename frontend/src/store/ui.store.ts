"use client";

import { create } from "zustand";
import type { Task } from "@/lib/types";

export type Dialog =
  | { kind: "closed" }
  | { kind: "add" }
  | { kind: "edit"; task: Task }
  | { kind: "delete"; task: Task };

type UiState = {
  dialog: Dialog;
  openAdd: () => void;
  openEdit: (task: Task) => void;
  openDelete: (task: Task) => void;
  closeDialog: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  dialog: { kind: "closed" },
  openAdd: () => set({ dialog: { kind: "add" } }),
  openEdit: (task) => set({ dialog: { kind: "edit", task } }),
  openDelete: (task) => set({ dialog: { kind: "delete", task } }),
  closeDialog: () => set({ dialog: { kind: "closed" } }),
}));
