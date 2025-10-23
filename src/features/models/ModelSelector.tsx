import { useState, useEffect, useRef } from 'react';
import { trpc } from '../../lib/trpc';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { ChevronDown, Bot } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelTag: string) => void;
}

export function ModelSelector({ selectedModel, onModelSelect }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customModel, setCustomModel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // AI Models available (using Gemini API for all)
  const models = [
    { id: '1', tag: 'gemini-1.5-pro-latest', name: 'Gemini 1.5 Pro', description: 'Latest Gemini 1.5 Pro model - Most capable' },
    { id: '2', tag: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', description: 'Fast Gemini 1.5 Flash model - Quick responses' },
    { id: '3', tag: 'gemini-pro-latest', name: 'Gemini Pro', description: 'Standard Gemini Pro model - Balanced performance' }
  ];
  const isLoading = false;

  const handleModelSelect = (modelTag: string) => {
    onModelSelect(modelTag);
    setIsOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomModelSubmit = () => {
    if (customModel.trim()) {
      handleModelSelect(customModel.trim());
      setCustomModel('');
    }
  };

  const selectedModelName = models?.find(m => m.tag === selectedModel)?.name || selectedModel;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        variant="outline"
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <span>{selectedModelName || 'Select a model'}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card 
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-gray-700 dark:bg-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Loading models...
              </div>
            ) : (
              <>
                {models?.map((model) => (
                  <button
                    key={model.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModelSelect(model.tag);
                    }}
                    className={`w-full text-left p-2 rounded hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors ${
                      selectedModel === model.tag ? 'bg-gray-600 dark:bg-gray-600' : ''
                    }`}
                  >
                    <div className="font-medium text-white">{model.name}</div>
                    <div className="text-sm text-gray-300">{model.tag}</div>
                    {model.description && (
                      <div className="text-xs text-gray-300 mt-1">
                        {model.description}
                      </div>
                    )}
                  </button>
                ))}

                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCustomInput(!showCustomInput);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-gray-600 dark:hover:bg-gray-600 text-sm text-white transition-colors"
                  >
                    + Add custom model
                  </button>

                  {showCustomInput && (
                    <div className="mt-2 flex gap-2">
                      <Input
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder="Enter model tag (e.g., gpt-4o)"
                        className="flex-1"
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomModelSubmit()}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCustomModelSubmit();
                        }}
                        size="sm"
                        disabled={!customModel.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
