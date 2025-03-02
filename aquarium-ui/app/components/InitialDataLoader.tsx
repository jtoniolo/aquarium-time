"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchLatestSun } from "../store/sunSlice";
import type { AppDispatch } from "../store/store";

export default function InitialDataLoader() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchLatestSun());
  }, [dispatch]);

  return null;
}
