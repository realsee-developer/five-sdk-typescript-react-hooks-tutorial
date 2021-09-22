import React, { FC, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Five, Mode, State, Work, parseWork } from "@realsee/five";
import { createFiveProvider, FiveCanvas, useFiveEventCallback, useFiveState, useFiveCurrentState } from "@realsee/five/react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import FlipCameraAndroidIcon from "@mui/icons-material/FlipCameraAndroid";
import PauseIcon from "@mui/icons-material/Pause";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Recorder } from "./recorder";

// work.json 的数据 URL
const workURL = "https://vrlab-public.ljcdn.com/release/static/image/release/five/work-sample/4e18246c206ba031abf00ee5028920e1/work.json";

/**
 * React Hook: 通过 work.json 的地址 获取 work 对象
 * @param url work.json 的数据地址
 * @returns work 对象，如果获取中，返回 null
 */
function useFetchWork(url: string) {
  const [work, setWork] = useState<Work | null>(null);
  useEffect(() => {
    setWork(null);
    fetch(url)
      .then(response => response.text())
      .then(text => setWork(parseWork(text)));
  },[url]);
  return work;
}

/**
 * 获取当前窗口的尺寸
 */
function getWindowDimensions() {
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * React Hook: 获取当前窗口的尺寸
 */
function useWindowDimensions() {
  const [size, setSize] = useState(getWindowDimensions);
  useEffect(() => {
    const listener = () => setSize(getWindowDimensions());
    window.addEventListener("resize", listener, false);
    return () => window.removeEventListener("resize", listener, false);
  });
  return size;
}

/**
 * React Component: 模态控制
 */
const ModeController: FC = () => {
  const [state, setState] = useFiveCurrentState();
  return <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
    <BottomNavigation
      showLabels
      value={state.mode}
      onChange={(_, newValue: Mode) => {
        setState({ mode: newValue });
      }}
    >
      <BottomNavigationAction label="全景漫游" icon={<DirectionsWalkIcon/>} value={Five.Mode.Panorama}/>
      <BottomNavigationAction label="空间总览" icon={<ViewInArIcon/>} value={Five.Mode.Floorplan}/>
    </BottomNavigation>
  </Paper>;
}

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
}

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
}

const FiveProvider = createFiveProvider();
const App: FC = () => {
  const work = useFetchWork(workURL);
  const size = useWindowDimensions();
  return work && <FiveProvider initialWork={work}>
    <FiveCanvas {...size}/>
    <ModeController/>
    <LookAroundController/>
    <RecorderController/>
  </FiveProvider>;
};

ReactDOM.render(<App/>, document.querySelector("#app"));

export {};