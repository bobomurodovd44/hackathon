'use client'

import { useFontSize, FontSize } from '@/contexts/font-size-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function FontSizeSelector() {
  const { fontSize, setFontSize } = useFontSize()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-10 h-10 rounded-full relative border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
           <img src="/icons8-increase-font.svg" alt="Font size" className="w-5 h-5 dark:invert" />
           {/* Visual indicator of the chosen size */}
           <span className="absolute -bottom-1 -right-1 text-[10px] font-mono font-bold bg-black text-white dark:bg-white dark:text-black w-4 h-4 rounded-full flex items-center justify-center">
             {fontSize}
           </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setFontSize('S')} className="text-sm font-bold flex justify-between cursor-pointer">
          <span>Small</span>
          {fontSize === 'S' && <span>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFontSize('M')} className="text-sm font-bold flex justify-between cursor-pointer">
          <span>Medium</span>
          {fontSize === 'M' && <span>✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setFontSize('L')} className="text-sm font-bold flex justify-between cursor-pointer">
          <span>Large</span>
          {fontSize === 'L' && <span>✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
