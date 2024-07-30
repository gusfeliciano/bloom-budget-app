import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editedValue !== value) {
      onSave(editedValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  return isEditing ? (
    <Input
      ref={inputRef}
      value={editedValue}
      onChange={(e) => setEditedValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-full"
    />
  ) : (
    <span onClick={handleClick} className="cursor-pointer hover:underline">
      {value}
    </span>
  );
};

export default InlineEdit;