import React, { useState, useEffect } from "react";
import { XIcon, ExternalLinkIcon, CheckIcon } from "lucide-react";

interface HowToUseModalProps {
  onClose: () => void;
  apiKey?: string;
  onSaveApiKey?: (apiKey: string) => void;
}

export const HowToUseModal: React.FC<HowToUseModalProps> = ({ 
  onClose, 
  apiKey: initialApiKey = "", 
  onSaveApiKey 
}) => {
  const [apiKey, setApiKey] = useState<string>(initialApiKey);
  const [showApiKeySaved, setShowApiKeySaved] = useState<boolean>(false);
  
  // Reset the saved message after a delay
  useEffect(() => {
    let timer: number | null = null;
    if (showApiKeySaved) {
      timer = window.setTimeout(() => {
        setShowApiKeySaved(false);
      }, 3000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [showApiKeySaved]);
  
  // Handle saving the API key
  const handleSaveApiKey = () => {
    if (onSaveApiKey && apiKey.trim()) {
      onSaveApiKey(apiKey.trim());
      setShowApiKeySaved(true);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-800">Welcome to Muse</h2>
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <XIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-2">What is Muse?</h3>
            <p className="text-gray-700">
              Muse is a minimalist writing app with an AI editor/cowriter. It's designed to get out of the way of your writing while providing helpful suggestions from an AI assistant.
            </p>
          </section>
          
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Getting Started</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800">1. Set up your OpenAI API Key</h4>
                <p className="text-gray-700 mb-3">
                  Muse requires an OpenAI API key to generate suggestions. You can enter it below or click the settings icon <span className="inline-block"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></span> in the top-right corner later.
                </p>
                
                <div className="flex items-center space-x-2 mb-3">
                  <input
                    type="password"
                    placeholder="Enter your OpenAI API key (starts with sk-...)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <button
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onClick={handleSaveApiKey}
                    disabled={!apiKey.trim() || !onSaveApiKey}
                  >
                    Save
                  </button>
                </div>
                
                {showApiKeySaved && (
                  <div className="flex items-center text-green-600 mb-3">
                    <CheckIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">API key saved successfully!</span>
                  </div>
                )}
                
                <p className="text-gray-700 mt-1">
                  Don't have an API key? <a href="https://platform.openai.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
                    Sign up for one here 
                    <ExternalLinkIcon className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800">2. Start Writing</h4>
                <p className="text-gray-700">
                  Just start typing in the editor. The AI will provide suggestions after you pause typing for a few seconds.
                </p>
              </div>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Key Features</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>
                <strong>AI Suggestions:</strong> The AI will provide suggestions based on your writing. These appear on the sides and fade away if you continue typing.
              </li>
              <li>
                <strong>Chattiness Control:</strong> Adjust how frequently the AI provides suggestions using the slider in settings.
              </li>
              <li>
                <strong>File Management:</strong> Save your work to a local file and open existing text files using the menu in the top-left corner.
              </li>
              <li>
                <strong>Distraction-Free Writing:</strong> The minimalist interface keeps the focus on your writing.
              </li>
            </ul>
          </section>
          
          <section>
            <h3 className="text-xl font-medium text-gray-800 mb-2">How AI Suggestions Work</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Suggestions only appear after you stop typing for a few seconds</li>
              <li>The AI will not continuously interrupt you with suggestions</li>
              <li>New suggestions are only generated after you resume typing and then pause again</li>
              <li>For longer documents, the AI maintains a running summary to provide context-aware suggestions</li>
            </ul>
          </section>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={onClose}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};
