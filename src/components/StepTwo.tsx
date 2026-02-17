import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useCustomExtracts } from '@/hooks/useCustomCream';
import { Loader2 } from 'lucide-react';

interface StepTwoProps {
  selectedExtracts: string[];
  onToggleExtract: (extract: string) => void;
}

const StepTwo: React.FC<StepTwoProps> = ({ selectedExtracts, onToggleExtract }) => {
  const { data: extracts = [], isLoading, error } = useCustomExtracts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🌿 Paso 2</h2>
          <p className="text-[#7d8768] font-audrey">Elige hasta dos extractos botánicos</p>
        </div>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#7d8768]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🌿 Paso 2</h2>
          <p className="text-[#7d8768] font-audrey">Elige hasta dos extractos botánicos</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar los extractos. Por favor intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🌿 Paso 2</h2>
        <p className="text-[#7d8768] font-audrey">Elige hasta dos extractos botánicos</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {extracts.map((extract) => {
          const isSelected = selectedExtracts.includes(extract.id);
          const canSelect = selectedExtracts.length < 2 || isSelected;
          
          return (
            <Card 
              key={extract.id}
              className={`cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-[#7d8768] bg-[#7d8768]/10' 
                  : canSelect ? 'hover:shadow-md' : 'opacity-50'
              }`}
              onClick={() => canSelect && onToggleExtract(extract.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Checkbox 
                    checked={isSelected}
                    disabled={!canSelect}
                    className="mr-2"
                  />
                  <span className="text-2xl">{extract.emoji}</span>
                </div>
                <h3 className="font-medium text-sm font-gilda-display">{extract.name}</h3>
                {extract.priceModifier > 0 && (
                  <p className="text-xs text-[#7d8768] font-semibold mt-1">+Q. {extract.priceModifier.toFixed(2)}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StepTwo;