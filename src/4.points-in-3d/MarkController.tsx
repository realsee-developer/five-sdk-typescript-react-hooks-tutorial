import * as THREE from "three";
import React, { FC, useState, useEffect } from "react";
import { useFiveEventCallback, useFiveModelIntersectRaycaster } from "@realsee/five/react";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

/**
 * React Component: 标记坐标点
 */
const MarkController: FC = () => {
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
};

export { MarkController };