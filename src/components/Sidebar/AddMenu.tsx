import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CloneDialog } from './CloneDialog';
import { useApp } from '@/contexts/AppContext';

export function AddMenu() {
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const { openProject } = useApp();

  return (
    <>
      <div className="p-2 border-t border-[#333]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-[#444] text-[#e0e0e0] hover:bg-[#2a2a2a]"
            >
              <span className="mr-2">+</span> Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#444]">
            <DropdownMenuItem
              onClick={() => setShowCloneDialog(true)}
              className="text-[#e0e0e0] focus:bg-[#383838] focus:text-[#e0e0e0]"
            >
              Clone from URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={openProject}
              className="text-[#e0e0e0] focus:bg-[#383838] focus:text-[#e0e0e0]"
            >
              Open Local Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CloneDialog open={showCloneDialog} onOpenChange={setShowCloneDialog} />
    </>
  );
}
