import React, { FC, useState, useCallback } from "react";
import { useFiveEventCallback, useFiveState } from "@realsee/five/react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Recorder } from "./recorder";

/**
 * ReactComponent: 状态录制
 */
const RecorderController: FC = () => {
  const [state, setState] = useFiveState();
  const [recording, toggleRecording] = useState(false);
  const [playing, togglePlaying] = useState(false);
  const [recorder] = useState(() => new Recorder());
  const startRecording = useCallback(() => {
    recorder.startRecording();
    toggleRecording(true);
  }, [recorder]);
  const endRecording = useCallback(() => {
    recorder.endRecording();
    toggleRecording(false);
  }, [recorder]);
  const play = useCallback(() => {
    const hasRecord = recorder.play((state, isFinal) => {
      setState(state);
      togglePlaying(!isFinal);
    });
    togglePlaying(hasRecord);
  }, []);
  useFiveEventCallback("stateChange", (state) => {
    recorder.record(state);
  });
  if (recording) {
    return <Paper sx={{ position: "fixed", top: 10, left: 10 }}>
      <IconButton onClick={endRecording}><StopIcon/></IconButton>
      <Button disabled>录制中</Button>
    </Paper>
  }
  if (playing) {
    return <Paper sx={{ position: "fixed", top: 10, left: 10 }}>
      <Button disabled>回放中</Button>
    </Paper>
  }
  return <Paper sx={{ position: "fixed", top: 10, left: 10 }}>
    <IconButton onClick={startRecording}><FiberManualRecordIcon/></IconButton>
    <IconButton onClick={play}><PlayArrowIcon/></IconButton>
  </Paper>;
};

export { RecorderController };