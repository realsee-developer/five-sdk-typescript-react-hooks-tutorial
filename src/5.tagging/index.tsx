import * as THREE from "three";
import React, { FC, useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Five, Mode, Work, parseWork } from "@realsee/five";
import { createFiveProvider, FiveCanvas, useFiveCurrentState, useFiveEventCallback, useFiveProject2d } from "@realsee/five/react";
import Button from "@mui/material/Button";
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
 * React Component: 打标签
 */
const TaggingController: FC = () => {
  type Tag = { position?: THREE.Vector3, label: string };
  const project2d = useFiveProject2d();

  const [tags, setTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState<Tag | null>(null);

  const tagElement = useCallback((tag, key?: number | string) => {
    const position = tag.position && project2d(tag.position, true);
    const style = position ? { left: position.x, top: position.y } : { display: "none" };
    return <div className="tag" style={style} key={key}>
      <div className="tag-pannel"><span className="tag-content">{tag.label}</span></div>
    </div>
  }, []);

  const addTag = useCallback(() => {
    setNewTag({ label: window.prompt("添加标签", "") || "未命名" });
  }, []);

  useFiveEventCallback("intersectionOnModelUpdate", intersect => {
    if (newTag) setNewTag({ position: intersect.point, label: newTag.label });
  }, [newTag]);

  useFiveEventCallback("wantsTapGesture", raycaster => {
    if (newTag && newTag.position) {
      setTags(tags => tags.concat(newTag));
      setNewTag(null);
      return false;
    }
  }, [newTag]);

  return <React.Fragment>
    <Paper sx={{ position: "fixed", top: 10, left: 10 }}>
      <Button onClick={addTag}>打标签</Button>
    </Paper>
    {newTag && tagElement(newTag)}
    {tags.map((tag, index) => tagElement(tag, index))}
  </React.Fragment>;
}

const FiveProvider = createFiveProvider();
const App: FC = () => {
  const work = useFetchWork(workURL);
  const size = useWindowDimensions();
  return work && <FiveProvider initialWork={work}>
    <FiveCanvas {...size}/>
    <ModeController/>
    <TaggingController/>
  </FiveProvider>;
};

ReactDOM.render(<App/>, document.querySelector("#app"));

export {};