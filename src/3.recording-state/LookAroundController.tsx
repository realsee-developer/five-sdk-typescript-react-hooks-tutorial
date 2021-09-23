import React, { FC, useState, useEffect } from "react";
import { useFiveCurrentState } from "@realsee/five/react";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import PauseIcon from "@mui/icons-material/Pause";

/**
 * ReactComponent: 自动环视按钮
 */
const LookAroundController: FC = () => {
  const [currentState, setState] = useFiveCurrentState();
  const [active, toggleActive] = useState(false);
  useEffect(() => {
    if (active) {
      const timer = window.setInterval(() => {
        setState(prevState => {
          return { longitude: prevState.longitude + Math.PI / 360 };
        });
      }, 16);
      return () => window.clearInterval(timer);
    }
  }, [active]);
  return <Paper sx={{ position: "fixed", top: 10, right: 10 }}>
  {active ?
    <IconButton onClick={() => toggleActive(false)}><PauseIcon/></IconButton>:
    <IconButton onClick={() => toggleActive(true)}><FlipCameraAndroidIcon/></IconButton>
  }
  </Paper>;
};

export { LookAroundController };