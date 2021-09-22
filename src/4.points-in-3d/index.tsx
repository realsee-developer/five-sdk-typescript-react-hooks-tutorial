import * as THREE from "three";
import React, { FC, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Five, Mode, Work, parseWork } from "@realsee/five";
import { createFiveProvider, FiveCanvas, useFiveCurrentState, useFiveEventCallback, useFiveModelIntersectRaycaster } from "@realsee/five/react";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import ViewInArIcon from "@mui/icons-material/ViewInAr";

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
 * React Component: 标记坐标点
 */
const MarkController: FC = ()=> {
  const [active, toggleActive] = useState(false);
  const [marks, setMarks] = useState<THREE.Vector3[]>([]);
  const modelIntersectRaycaster = useFiveModelIntersectRaycaster();
  useFiveEventCallback("wantsTapGesture", (raycaster) => {
    if (active) {
      const [intersect] = modelIntersectRaycaster(raycaster);
      if (intersect) setMarks(marks => marks.concat(intersect.point));
      return false;
    }
  }, [active]);
  return <Paper sx={{ position: "fixed", top: 10, left: 10, padding: 1 }}>
    <Stack>
      <Stack direction="row">
        <Switch
          checked={active}
          onChange={(event, checked) => toggleActive(checked)}
        /> <Button disabled>开启点击记录坐标</Button>
      </Stack>
      <Stack spacing={1}>
      {marks.map((point, index) => {
        const { x, y, z } = point;
        return <Chip
          key={index}
          label={`x=${x.toFixed(2)} y=${y.toFixed(2)} z=${z.toFixed(2)}`}
          onDelete={() => setMarks(marks => marks.filter((_, index_) => index_ !== index))}
        />
      })}
      </Stack>
    </Stack>
  </Paper>
}

const FiveProvider = createFiveProvider();
const App: FC = () => {
  const work = useFetchWork(workURL);
  const size = useWindowDimensions();
  return work && <FiveProvider initialWork={work}>
    <FiveCanvas {...size}/>
    <ModeController/>
    <MarkController/>
  </FiveProvider>;
};

ReactDOM.render(<App/>, document.querySelector("#app"));

export {};