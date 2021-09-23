import * as THREE from "three";
import React, { FC, useState, useCallback } from "react";
import { useFiveEventCallback, useFiveProject2d } from "@realsee/five/react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

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
};

export { TaggingController };