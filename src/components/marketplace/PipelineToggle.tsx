
import React from 'react';
import { Button } from '@/components/ui/button';
import { Workflow, ChevronDown, ChevronUp } from 'lucide-react';

interface PipelineToggleProps {
  showPipeline: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export const PipelineToggle: React.FC<PipelineToggleProps> = ({
  showPipeline,
  onToggle,
  disabled,
}) => {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
      disabled={disabled}
    >
      <Workflow className="w-4 h-4 mr-2" />
      {showPipeline ? 'Hide' : 'Show'} Pipeline
      {showPipeline ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
    </Button>
  );
};
