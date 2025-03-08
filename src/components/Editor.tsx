import React, { useEffect, useRef } from "react";
interface EditorProps {
  content: string;
  setContent: (content: string) => void;
}
export const Editor: React.FC<EditorProps> = ({
  content,
  setContent
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  // Focus editor on load
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    setContent(newContent);
  };
  // Update the editor content when the content prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerText !== content) {
      editorRef.current.innerText = content;
    }
  }, [content]);
  return <div className="flex-1 flex flex-col items-center py-8 px-4 overflow-auto">
      <div className="w-full max-w-2xl">
        <div ref={editorRef} contentEditable className="min-h-[calc(100vh-8rem)] w-full outline-none text-lg leading-relaxed text-gray-800 font-serif" onInput={handleInput} suppressContentEditableWarning={true} />
      </div>
    </div>;
};