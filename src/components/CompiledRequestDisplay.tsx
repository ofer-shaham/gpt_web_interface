import React from 'react';

interface CompiledRequest {
  instructions: string;
}

interface CompiledRequestDisplayProps {
  compiledRequest: CompiledRequest;
}

const CompiledRequestDisplay: React.FC<CompiledRequestDisplayProps> = ({ compiledRequest }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-2">Compiled Instructions</h2>
      <p>{compiledRequest.instructions}</p>
    </div>
  );
};

export default CompiledRequestDisplay;
