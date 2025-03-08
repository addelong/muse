import React from "react";
import { XIcon } from "lucide-react";

interface SuggestionPanelProps {
  position: "left" | "right";
  visible: boolean;
  suggestion: {
    type: string;
    title?: string;
    content: string;
    emoji?: string;
  };
  onClose: () => void;
}
export const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  position,
  visible,
  suggestion,
  onClose
}) => {
  // Get the emoji or a default one
  const getEmoji = () => {
    return suggestion.emoji || "💡";
  };

  // Get the title or a default one based on type
  const getTitle = () => {
    return suggestion.title || `${suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)} Suggestion`;
  };
  // Get the appropriate color based on suggestion type
  const getColor = () => {
    // Map common suggestion types to specific colors
    const colorMap: Record<string, string> = {
      "style": "bg-blue-50 border-blue-200",
      "rewrite": "bg-blue-50 border-blue-200",
      "question": "bg-purple-50 border-purple-200",
      "character": "bg-green-50 border-green-200",
      "plot": "bg-amber-50 border-amber-200",
      "theme": "bg-indigo-50 border-indigo-200",
      "pacing": "bg-orange-50 border-orange-200",
      "dialogue": "bg-pink-50 border-pink-200",
      "setting": "bg-teal-50 border-teal-200",
      "emotion": "bg-red-50 border-red-200",
      "engagement": "bg-yellow-50 border-yellow-200",
      "structure": "bg-cyan-50 border-cyan-200"
    };
    
    // Return the mapped color or a default color
    return colorMap[suggestion.type.toLowerCase()] || "bg-gray-50 border-gray-200";
  };
  return <div className={`w-full mb-4 transition-all duration-300 ease-in-out ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {visible && <div className={`w-full rounded-lg border p-4 shadow-sm ${getColor()}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl" role="img" aria-label="suggestion icon">{getEmoji()}</span>
              <h3 className="font-medium text-gray-800">{getTitle()}</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
              <XIcon className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {suggestion.content}
          </div>
        </div>}
    </div>;
};
