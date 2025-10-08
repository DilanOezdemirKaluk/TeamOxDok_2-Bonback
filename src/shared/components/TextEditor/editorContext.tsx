import { createContext, useContext, useState, RefObject } from "react";

interface EditorContextType {
  activeEditor: HTMLDivElement | null;
  setActiveEditor: (editor: HTMLDivElement | null) => void;
  applyCommand: (command: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [activeEditor, setActiveEditor] = useState<HTMLDivElement | null>(null);

  const applyCommand = (command: string) => {
    if (activeEditor) {
      document.execCommand(command, false, "");
    }
  };

  return (
    <EditorContext.Provider
      value={{ activeEditor, setActiveEditor, applyCommand }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider");
  }
  return context;
}
