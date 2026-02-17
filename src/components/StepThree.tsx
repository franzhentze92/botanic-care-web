import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCustomFunctions } from '@/hooks/useCustomCream';
import { Loader2 } from 'lucide-react';

interface StepThreeProps {
  selectedFunction: string;
  onSelectFunction: (func: string) => void;
}

const StepThree: React.FC<StepThreeProps> = ({ selectedFunction, onSelectFunction }) => {
  const { data: functions = [], isLoading, error } = useCustomFunctions();
  const selectedFunctionData = functions.find(f => f.id === selectedFunction);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">✨ Paso 3</h2>
          <p className="text-[#7d8768] font-audrey">Elige una función activa</p>
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
          <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">✨ Paso 3</h2>
          <p className="text-[#7d8768] font-audrey">Elige una función activa</p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Error al cargar las funciones. Por favor intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">✨ Paso 3</h2>
        <p className="text-[#7d8768] font-audrey">Elige una función activa</p>
      </div>
      
      <div className="max-w-md mx-auto">
        <Select value={selectedFunction} onValueChange={onSelectFunction}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una función" />
          </SelectTrigger>
          <SelectContent>
            {functions.map((func) => (
              <SelectItem key={func.id} value={func.id}>
                <span className="flex items-center">
                  <span className="mr-2">{func.emoji}</span>
                  {func.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedFunctionData && (
        <Card className="max-w-md mx-auto bg-[#7d8768]/10 border-[#7d8768]/20">
          <CardContent className="p-4">
            <h3 className="font-semibold text-[#7d8768] mb-2 flex items-center font-gilda-display">
              <span className="mr-2">{selectedFunctionData.emoji}</span>
              {selectedFunctionData.name}
              {selectedFunctionData.priceModifier > 0 && (
                <span className="ml-auto text-sm font-semibold">+Q. {selectedFunctionData.priceModifier.toFixed(2)}</span>
              )}
            </h3>
            <p className="text-sm text-[#7d8768] mb-2 font-audrey">Incluye:</p>
            <ul className="text-sm text-[#7d8768] space-y-1">
              {selectedFunctionData.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center font-audrey">
                  <span className="w-1 h-1 bg-[#7d8768] rounded-full mr-2"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StepThree;