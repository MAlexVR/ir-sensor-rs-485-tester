"use client";

import { useState } from "react";
import {
  Thermometer,
  Zap,
  Info,
  Menu,
  X,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserManualModal } from "@/components/molecules/UserManualModal";

interface HeaderProps {
  onAboutClick?: () => void;
}

export function Header({ onAboutClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAboutClick = () => {
    setMenuOpen(false);
    onAboutClick?.();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl safe-top">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <Thermometer className="w-7 h-7 md:w-9 md:h-9 text-sena-cyan" />
            <Zap className="w-3 h-3 md:w-4 md:h-4 text-sena-green absolute -bottom-0.5 -right-0.5" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-bold leading-tight">
              IR Sensor RS-485 Tester
            </h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Termómetro Infrarrojo • SENA CEET
            </p>
          </div>
          <h1 className="sm:hidden text-sm font-bold">IR-485 Tester</h1>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
          <Badge className="text-xs bg-sena-green/20 text-sena-green border-sena-green/30">
            v1.0
          </Badge>
          <UserManualModal />
          <Button variant="ghost" size="sm" onClick={handleAboutClick}>
            <Info className="w-4 h-4 mr-1" />
            Acerca de
          </Button>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="container px-4 py-3 space-y-2">
            <UserManualModal
              triggerVariant="ghost"
              triggerClassName="w-full justify-start"
            >
              <HelpCircle className="w-4 h-4" />
              Manual de Usuario
            </UserManualModal>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleAboutClick}
            >
              <Info className="w-4 h-4" />
              Acerca de
            </Button>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">
                SENA - CEET
              </span>
              <Badge className="text-xs bg-sena-green/20 text-sena-green border-sena-green/30">
                v1.0
              </Badge>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
