import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCustomOils } from '@/hooks/useCustomCream';
import { Loader2 } from 'lucide-react';

interface StepOneProps {
  selectedOil: string;
  onSelectOil: (oil: string) => void;
}

const StepOne: React.FC<StepOneProps> = ({ selectedOil, onSelectOil }) => {
  const { data: oils = [], isLoading, error } = useCustomOils();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🟢 Paso 1</h2>
          <p className="text-[#7d8768] text-lg font-audrey">Elige un aceite vegetal</p>
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
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🟢 Paso 1</h2>
          <p className="text-[#7d8768] text-lg font-audrey">Elige un aceite vegetal</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar los aceites. Por favor intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🟢 Paso 1</h2>
        <p className="text-[#7d8768] text-lg font-audrey">Elige un aceite vegetal</p>
      </div>
      
      <RadioGroup value={selectedOil} onValueChange={onSelectOil}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {oils.map((oil) => (
            <Card 
              key={oil.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedOil === oil.id 
                  ? 'ring-2 ring-[#7d8768] bg-gradient-to-br from-[#7d8768]/10 to-[#9d627b]/10 shadow-lg' 
                  : 'hover:shadow-md hover:scale-105 bg-white'
              }`}
              onClick={() => onSelectOil(oil.id)}
            >
              <CardContent className="p-4 text-center relative">
                <RadioGroupItem 
                  value={oil.id} 
                  id={oil.id}
                  className="absolute top-2 right-2"
                />
                <Label htmlFor={oil.id} className="cursor-pointer">
                  <div className="text-4xl mb-3">{oil.emoji}</div>
                  <h3 className="font-semibold text-sm text-gray-800 mb-1 leading-tight font-gilda-display">{oil.name}</h3>
                  <p className="text-xs text-gray-500 font-audrey">{oil.description}</p>
                  {oil.priceModifier > 0 && (
                    <p className="text-xs text-[#7d8768] font-semibold mt-1">+Q. {oil.priceModifier.toFixed(2)}</p>
                  )}
                </Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
};

export default StepOne;