import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, Plus, X, Tag as TagIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tag } from "../types";
import { useTags } from "../hooks/useTags";

interface TagSelectorProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  className?: string;
}

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

export function TagSelector({ selectedTags, onTagsChange, className }: TagSelectorProps) {
  const { tags, addTag } = useTags();
  const [open, setOpen] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(DEFAULT_COLORS[0]);

  const handleSelectTag = (tag: Tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await addTag({
        name: newTagName.trim(),
        color: newTagColor,
      });
      
      onTagsChange([...selectedTags, newTag]);
      setNewTagName("");
      setNewTagColor(DEFAULT_COLORS[0]);
      setShowCreateTag(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    }
  };

  const handleRemoveTag = (tagToRemove: Tag) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagToRemove.id));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor="tags">Tags</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreateTag(true)}
          className="h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Tag
        </Button>
      </div>
      
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
              className="text-xs px-2 py-1"
            >
              {tag.name}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Quick Create Tag Form */}
      {showCreateTag && (
        <div className="border rounded-md p-3 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Create New Tag</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCreateTag(false);
                setNewTagName("");
              }}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateTag();
              } else if (e.key === "Escape") {
                setShowCreateTag(false);
                setNewTagName("");
              }
            }}
            autoFocus
          />
          <div className="space-y-2">
            <Label className="text-xs">Color</Label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewTagColor(color)}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all",
                    newTagColor === color ? "border-gray-900 scale-110" : "border-gray-300"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim()}
              className="flex-1"
            >
              Create Tag
            </Button>
          </div>
        </div>
      )}

      {/* Tag Selection Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal"
          >
            <TagIcon className="mr-2 h-4 w-4" />
            {selectedTags.length === 0 ? "Select tags..." : `${selectedTags.length} tag${selectedTags.length === 1 ? '' : 's'} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>
                <div className="py-6 text-center text-sm">
                  <p className="mb-2">No tags found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateTag(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new tag
                  </Button>
                </div>
              </CommandEmpty>
              
              {!showCreateTag && (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => setShowCreateTag(true)}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create new tag
                  </CommandItem>
                </CommandGroup>
              )}

              {showCreateTag && (
                <CommandGroup heading="Create New Tag">
                  <div className="p-3 space-y-3">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateTag();
                        } else if (e.key === "Escape") {
                          setShowCreateTag(false);
                          setNewTagName("");
                        }
                      }}
                      autoFocus
                    />
                    <div className="space-y-2">
                      <Label className="text-xs">Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewTagColor(color)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 transition-all",
                              newTagColor === color ? "border-gray-900 scale-110" : "border-gray-300"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCreateTag}
                        disabled={!newTagName.trim()}
                      >
                        Create
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCreateTag(false);
                          setNewTagName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              )}

              {tags.length > 0 && (
                <CommandGroup heading="Available Tags">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.some(t => t.id === tag.id);
                    return (
                      <CommandItem
                        key={tag.id}
                        onSelect={() => handleSelectTag(tag)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color }}
                          className="text-xs"
                        >
                          {tag.name}
                        </Badge>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}