import React, { FC } from "react";
import { createFiveProvider, FiveCanvas } from "@realsee/five/react";
import { useFetchWork } from "./useFetchWork";
import { useWindowDimensions } from "./useWindowDimensions";
import { ModeController } from "./ModeController";

/** work.json 的数据 URL */
const workURL = "https://vrlab-public.ljcdn.com/release/static/image/release/five/work-sample/07bdc58f413bc5494f05c7cbb5cbdce4/work.json";

const FiveProvider = createFiveProvider();
const App: FC = () => {
  const work = useFetchWork(workURL);
  const size = useWindowDimensions();
  return work && <FiveProvider initialWork={work}>
    <FiveCanvas {...size}/>
    <ModeController/>
  </FiveProvider>;
};

export { App };