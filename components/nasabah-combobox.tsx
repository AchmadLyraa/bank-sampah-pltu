"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Nasabah } from "@/types"

interface NasabahComboboxProps {
  nasabahList: Nasabah[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function NasabahCombobox({
  nasabahList,
  value,
  onValueChange,
  placeholder = "Pilih nasabah...",
}: NasabahComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedNasabah = nasabahList.find((nasabah) => nasabah.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3 bg-transparent"
        >
          {selectedNasabah ? (
            <div className="flex items-center gap-2 text-left">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-medium">{selectedNasabah.nama}</div>
                <div className="text-sm text-gray-500">Saldo: Rp {selectedNasabah.saldo.toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <User className="h-4 w-4" />
              {placeholder}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Cari nasabah..." />
          <CommandList>
            <CommandEmpty>Nasabah tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {nasabahList.map((nasabah) => (
                <CommandItem
                  key={nasabah.id}
                  value={`${nasabah.nama} ${nasabah.email} ${nasabah.telepon}`}
                  onSelect={() => {
                    onValueChange(nasabah.id === value ? "" : nasabah.id)
                    setOpen(false)
                  }}
                  className="flex items-center gap-2 py-3"
                >
                  <Check className={cn("mr-2 h-4 w-4", value === nasabah.id ? "opacity-100" : "opacity-0")} />
                  <User className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <div className="font-medium">{nasabah.nama}</div>
                    <div className="text-sm text-gray-500">
                      {nasabah.email} • Saldo: Rp {nasabah.saldo.toLocaleString()}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
