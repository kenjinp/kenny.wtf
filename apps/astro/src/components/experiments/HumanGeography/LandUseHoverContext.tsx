import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type LandUseHoverState = {
  siteIndex: number;
  clientX: number;
  clientY: number;
} | null;

type Ctx = {
  hover: LandUseHoverState;
  setHover: (h: LandUseHoverState) => void;
};

const LandUseHoverContext = createContext<Ctx | null>(null);

export function LandUseHoverProvider({ children }: { children: ReactNode }) {
  const [hover, setHover] = useState<LandUseHoverState>(null);
  return (
    <LandUseHoverContext.Provider value={{ hover, setHover }}>
      {children}
    </LandUseHoverContext.Provider>
  );
}

export function useLandUseHover(): Ctx {
  const c = useContext(LandUseHoverContext);
  if (!c) {
    throw new Error("useLandUseHover must be used within LandUseHoverProvider");
  }
  return c;
}
