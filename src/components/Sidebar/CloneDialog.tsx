import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

interface CloneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneDialog({ open, onOpenChange }: CloneDialogProps) {
  const [url, setUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const { cloneRepository } = useApp();

  const handleClone = async () => {
    if (!url.trim()) return;

    try {
      setIsCloning(true);
      await cloneRepository(url);
      onOpenChange(false);
      setUrl('');
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-[#444]">
        <DialogHeader>
          <DialogTitle className="text-[#e0e0e0]">Clone Git Repository</DialogTitle>
          <DialogDescription className="text-[#909090]">
            Enter the repository URL to clone
          </DialogDescription>
        </DialogHeader>

        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/user/repo.git"
          className="bg-[#1e1e1e] border-[#444] text-[#e0e0e0]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleClone();
            }
          }}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#444] text-[#e0e0e0] hover:bg-[#383838]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClone}
            disabled={!url.trim() || isCloning}
            className="bg-[#4a9eff] hover:bg-[#3a8eef] text-white"
          >
            {isCloning ? 'Cloning...' : 'Clone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
