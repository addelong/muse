import React, { useState, useEffect, useRef } from "react";
import { MenuIcon, SaveIcon, SettingsIcon, HelpCircleIcon, XIcon, VolumeIcon, Volume1Icon, Volume2Icon, FolderOpenIcon } from "lucide-react";

interface HeaderProps {
  chattiness: number;
  setChattiness: (value: number) => void;
  content: string;
  setContent: (content: string) => void;
  onShowHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({ chattiness, setChattiness, content, setContent, onShowHelp }) => {
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const [localChattiness, setLocalChattiness] = useState<number>(chattiness);
  const saveFileRef = useRef<HTMLInputElement>(null);
  const openFileRef = useRef<HTMLInputElement>(null);
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("openai_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // State for filename input modal
  const [showFilenameModal, setShowFilenameModal] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('document.txt');

  // Handle saving the document
  const handleSave = async () => {
    try {
      // Check if the File System Access API is available
      if ('showSaveFilePicker' in window) {
        // @ts-ignore - TypeScript doesn't have types for this API yet
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'Text Documents',
              accept: {
                'text/plain': ['.txt'],
              },
            },
          ],
        });
        
        // Create a writable stream and write the content
        // @ts-ignore - TypeScript doesn't have types for this API yet
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
      } else {
        // Fallback for browsers that don't support the File System Access API
        setShowFilenameModal(true);
      }
    } catch (error) {
      console.error('Error saving file:', error);
      // If the user cancels the save dialog or there's an error, show the filename modal
      setShowFilenameModal(true);
    }
  };
  
  // Handle saving with a specific filename (fallback method)
  const handleSaveWithFilename = () => {
    // Create a Blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close the modal
    setShowFilenameModal(false);
  };

  // Handle opening a file
  const handleOpenFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
    
    // Reset the input
    if (openFileRef.current) {
      openFileRef.current.value = '';
    }
    
    // Close the menu
    setShowMenu(false);
  };
  
  // Update local chattiness when prop changes
  useEffect(() => {
    setLocalChattiness(chattiness);
  }, [chattiness]);
  
  // Save settings to localStorage and apply changes
  const saveSettings = () => {
    localStorage.setItem("openai_api_key", apiKey);
    setChattiness(localChattiness);
    setShowSettings(false);
    // Reload the page to apply the new API key if it changed
    if (apiKey !== localStorage.getItem("openai_api_key")) {
      window.location.reload();
    }
  };
  
  // Get the appropriate volume icon based on chattiness level
  const getVolumeIcon = () => {
    if (localChattiness < 0.33) {
      return <VolumeIcon className="h-5 w-5 text-gray-600" />;
    } else if (localChattiness < 0.66) {
      return <Volume1Icon className="h-5 w-5 text-gray-600" />;
    } else {
      return <Volume2Icon className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <>
      <header className="flex items-center justify-between w-full px-4 h-14 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <button 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MenuIcon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-medium text-gray-800">Muse</h1>
        </div>
        <div className="flex items-center space-x-2">
          <a 
            href="https://www.buymeacoffee.com/alandelong" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <img 
              src="https://img.buymeacoffee.com/button-api/?text=Tip jar&emoji=&slug=alandelong&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" 
              alt="Buy Me A Coffee" 
              className="h-8"
            />
          </a>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
            title="Save"
            onClick={handleSave}
          >
            <SaveIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
            title="Settings"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-100 transition-colors" 
            title="Help"
            onClick={onShowHelp}
          >
            <HelpCircleIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* Hidden file input for opening files */}
      <input
        type="file"
        ref={openFileRef}
        style={{ display: 'none' }}
        accept=".txt,.md,.text"
        onChange={handleOpenFile}
      />
      
      {/* Menu */}
      {showMenu && (
        <div className="absolute left-0 top-14 w-64 bg-white shadow-lg rounded-br-md z-40">
          <div className="py-2">
            <button 
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              onClick={() => {
                if (openFileRef.current) {
                  openFileRef.current.click();
                }
              }}
            >
              <FolderOpenIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span>Open File</span>
            </button>
            <button 
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center"
              onClick={handleSave}
            >
              <SaveIcon className="h-5 w-5 mr-2 text-gray-600" />
              <span>Save</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Filename Modal */}
      {showFilenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Save Document</h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowFilenameModal(false)}
              >
                <XIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
                Filename
              </label>
              <input
                type="text"
                id="filename"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setShowFilenameModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={handleSaveWithFilename}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => setShowSettings(false)}
              >
                <XIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="mb-6">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                OpenAI API Key
              </label>
              <input
                type="password"
                id="apiKey"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="chattiness" className="block text-sm font-medium text-gray-700">
                  AI Chattiness
                </label>
                <div className="flex items-center">
                  {getVolumeIcon()}
                  <span className="ml-1 text-sm text-gray-500">
                    {localChattiness < 0.33 ? 'Low' : localChattiness < 0.66 ? 'Medium' : 'High'}
                  </span>
                </div>
              </div>
              <input
                type="range"
                id="chattiness"
                min="0"
                max="1"
                step="0.01"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                value={localChattiness}
                onChange={(e) => setLocalChattiness(parseFloat(e.target.value))}
              />
              <p className="mt-1 text-sm text-gray-500">
                Adjust how frequently the AI editor provides suggestions.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onClick={saveSettings}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
