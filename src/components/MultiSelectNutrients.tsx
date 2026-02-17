import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { X, ChevronDown, Search } from 'lucide-react';
import { useNutrients } from '@/hooks/useNutrients';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectNutrientsProps {
  selectedNutrientIds: number[];
  onSelectionChange: (nutrientIds: number[]) => void;
  className?: string;
}

export const MultiSelectNutrients: React.FC<MultiSelectNutrientsProps> = ({
  selectedNutrientIds,
  onSelectionChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: nutrients = [], isLoading } = useNutrients();

  // Filtrar nutrientes por búsqueda
  const filteredNutrients = nutrients.filter(nutrient =>
    nutrient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selección de nutriente
  const toggleNutrient = (nutrientId: number) => {
    if (selectedNutrientIds.includes(nutrientId)) {
      onSelectionChange(selectedNutrientIds.filter(id => id !== nutrientId));
    } else {
      onSelectionChange([...selectedNutrientIds, nutrientId]);
    }
  };

  // Obtener nombres de nutrientes seleccionados
  const selectedNutrients = nutrients.filter(n => selectedNutrientIds.includes(n.id));

  // Obtener texto para el botón
  const getButtonText = () => {
    if (selectedNutrientIds.length === 0) {
      return 'Seleccionar nutrientes...';
    }
    if (selectedNutrientIds.length === 1) {
      return selectedNutrients[0]?.name || '1 nutriente seleccionado';
    }
    return `${selectedNutrientIds.length} nutrientes seleccionados`;
  };

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem]"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedNutrients.length === 0 ? (
                <span className="text-muted-foreground">Seleccionar nutrientes...</span>
              ) : (
                selectedNutrients.map((nutrient) => (
                  <Badge
                    key={nutrient.id}
                    variant="secondary"
                    className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] text-white border-0 mr-1 mb-1"
                  >
                    {nutrient.name}
                  </Badge>
                ))
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" onInteractOutside={(e) => e.preventDefault()}>
          <div className="p-2">
            {/* Búsqueda */}
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar nutrientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Lista de nutrientes */}
            <div className="max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#7d8768]" />
                  <span className="ml-2 text-sm text-muted-foreground">Cargando nutrientes...</span>
                </div>
              ) : filteredNutrients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {searchQuery ? 'No se encontraron nutrientes' : 'No hay nutrientes disponibles'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredNutrients.map((nutrient) => (
                    <label
                      key={nutrient.id}
                      htmlFor={`nutrient-${nutrient.id}`}
                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        id={`nutrient-${nutrient.id}`}
                        checked={selectedNutrientIds.includes(nutrient.id)}
                        onCheckedChange={() => toggleNutrient(nutrient.id)}
                      />
                      <span className="flex-1 text-sm font-medium leading-none cursor-pointer select-none">
                        {nutrient.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con contador */}
            {selectedNutrientIds.length > 0 && (
              <div className="border-t pt-2 mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedNutrientIds.length} seleccionado{selectedNutrientIds.length !== 1 ? 's' : ''}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelectionChange([]);
                    setSearchQuery('');
                  }}
                  className="h-7 text-xs"
                >
                  Limpiar
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

