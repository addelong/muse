import React, { useEffect, useState, useCallback, useRef } from "react";
import { Editor } from "./components/Editor";
import { Header } from "./components/Header";
import { SuggestionPanel } from "./components/SuggestionPanel";
import { HowToUseModal } from "./components/HowToUseModal";
import { openAIService, AISuggestion } from "./services/OpenAIService";
export function App() {
  const [content, setContent] = useState<string>("");
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [visibleSuggestions, setVisibleSuggestions] = useState<boolean[]>([]);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);
  const [lastSuggestionTime, setLastSuggestionTime] = useState<number>(0);
  const [chattiness, setChattiness] = useState<number>(0.5);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [showHowToUseModal, setShowHowToUseModal] = useState<boolean>(false);
  const typingTimerRef = useRef<number | null>(null);

  // Initialize app state and check if it's the first visit
  useEffect(() => {
    // Check if OpenAI API key is configured
    setApiKeyConfigured(openAIService.isInitialized());
    if (!openAIService.isInitialized()) {
      console.warn("OpenAI API key not configured. Please set the VITE_OPENAI_API_KEY environment variable.");
    }
    
    // Get chattiness level
    setChattiness(openAIService.getChattiness());
    
    // Check if it's the first visit
    const hasVisitedBefore = localStorage.getItem("muse_has_visited_before");
    if (!hasVisitedBefore) {
      setShowHowToUseModal(true);
      localStorage.setItem("muse_has_visited_before", "true");
    }
  }, []);
  
  // Handle closing the how-to-use modal
  const handleCloseHowToUseModal = () => {
    setShowHowToUseModal(false);
  };
  
  // Update chattiness in service when it changes in UI
  useEffect(() => {
    openAIService.setChattiness(chattiness);
  }, [chattiness]);
  // Generate suggestions using OpenAI
  const generateSuggestions = useCallback(async () => {
    if (!apiKeyConfigured || isGeneratingSuggestion || content.length < 50) {
      return;
    }

    // Don't generate suggestions too frequently
    const now = Date.now();
    if (now - lastSuggestionTime < 10000) { // At least 10 seconds between suggestions
      return;
    }

    // Only generate suggestions based on chattiness level
    // Higher chattiness = higher chance of generating suggestions
    if (Math.random() > (1 - chattiness * 0.7)) {
      setIsGeneratingSuggestion(true);
      try {
        const newSuggestions = await openAIService.generateSuggestions(content);
        if (newSuggestions.length > 0) {
          setSuggestions(newSuggestions);
          setVisibleSuggestions(new Array(newSuggestions.length).fill(true));
          
          // Set a timeout to hide suggestions
          const hideTimeout = 8000 + (newSuggestions.length * 1000); // Base timeout + extra time for multiple suggestions
          setTimeout(() => {
            setVisibleSuggestions(new Array(newSuggestions.length).fill(false));
          }, hideTimeout);
          
          setLastSuggestionTime(Date.now());
        }
      } catch (error) {
        console.error("Error generating suggestions:", error);
      } finally {
        setIsGeneratingSuggestion(false);
      }
    }
  }, [apiKeyConfigured, chattiness, content, isGeneratingSuggestion, lastSuggestionTime]);

  // Handle content changes and typing detection
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsTyping(true);
    
    // Clear existing timer
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    
    // Set new timer to detect when typing stops
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
      
      // Only generate suggestions if no suggestions are currently visible
      // and user has stopped typing
      if (!visibleSuggestions.some(visible => visible) && content.length > 50) {
        generateSuggestions();
      }
    }, 3000); // Wait 3 seconds after typing stops
  }, [content, generateSuggestions, visibleSuggestions]);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
    };
  }, []);
  // Close a specific suggestion
  const closeSuggestion = (index: number) => {
    const newVisibleSuggestions = [...visibleSuggestions];
    newVisibleSuggestions[index] = false;
    setVisibleSuggestions(newVisibleSuggestions);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      <Header 
        chattiness={chattiness} 
        setChattiness={setChattiness} 
        content={content}
        setContent={handleContentChange}
      />
      
      {showHowToUseModal && (
        <HowToUseModal onClose={handleCloseHowToUseModal} />
      )}
      <div className="flex flex-1 w-full">
        <div className="w-72 h-full flex flex-col items-center p-4 overflow-auto">
          {suggestions.slice(0, Math.ceil(suggestions.length / 2)).map((suggestion, index) => (
            <SuggestionPanel 
              key={`left-${index}`}
              position="left" 
              visible={visibleSuggestions[index]} 
              suggestion={suggestion} 
              onClose={() => closeSuggestion(index)} 
            />
          ))}
        </div>
        <Editor content={content} setContent={handleContentChange} />
        <div className="w-72 h-full flex flex-col items-center p-4 overflow-auto">
          {suggestions.slice(Math.ceil(suggestions.length / 2)).map((suggestion, index) => (
            <SuggestionPanel 
              key={`right-${index}`}
              position="right" 
              visible={visibleSuggestions[Math.ceil(suggestions.length / 2) + index]} 
              suggestion={suggestion} 
              onClose={() => closeSuggestion(Math.ceil(suggestions.length / 2) + index)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
