import { useRef, useState, useEffect } from "react";
import { useEditor } from "./editorContext";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function TextEditor({ value, onChange }: TextEditorProps) {
  const { setActiveEditor } = useEditor();
  const editorRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(65);

  useEffect(() => {
    setHeight(65);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newHeight = Math.max(
        100,
        startHeight + (moveEvent.clientY - startY)
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        ref={editorRef}
        contentEditable
        onFocus={() => setActiveEditor(editorRef.current)}
        onBlur={() => {
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          width: "97%",
          height: `${height}px`,
          maxHeight: "500px",
          marginTop: "5px",
          padding: "10px",
          fontSize: "16px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          outline: "none",
          overflow: "auto",
        }}
      />

      <div
        onMouseDown={handleMouseDown}
        style={{
          width: "50%",
          height: "5px",
          cursor: "ns-resize",
          background: "#ddd",
          position: "absolute",
          bottom: "0",
          left: "50%",
          transform: "translateX(-50%)",
          borderRadius: "5px",
        }}
      />
    </div>
  );
}
