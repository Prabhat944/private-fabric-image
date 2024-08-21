import DMSCanvas from "editor/src/DMSCanvas";
import { atom } from "jotai";

export const editorAtom = atom<DMSCanvas | undefined>(undefined);