"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { loadConfig } from "../store/configSlice";
import type { AppDispatch } from "../store/store";

export default function InitialDataLoader() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(loadConfig());
  }, [dispatch]);

  return null;
}
