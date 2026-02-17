import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCustomOils, useCustomExtracts, useCustomFunctions, calculateCustomCreamPrice } from '@/hooks/useCustomCream';
import { Loader2 } from 'lucide-react';

interface PurchaseStepProps {
  selectedOil: string;
  selectedExtracts: string[];
  selectedFunction: string;
  onAddToCart: (price?: number) => void;
  onAddToSubscription: (price?: number) => void;
}

const PurchaseStep: React.FC<PurchaseStepProps> = ({ 
  selectedOil, 
  selectedExtracts, 
  selectedFunction, 
  onAddToCart,
  onAddToSubscription
}) => {
  const { data: oils = [] } = useCustomOils();
  const { data: extracts = [] } = useCustomExtracts();
  const { data: functions = [] } = useCustomFunctions();
  const [purchaseOption, setPurchaseOption] = useState('');
  const [finalPrice, setFinalPrice] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);

  const selectedOilData = oils.find(o => o.id === selectedOil);
  const selectedExtractsData = extracts.filter(e => selectedExtracts.includes(e.id));
  const selectedFunctionData = functions.find(f => f.id === selectedFunction);

  useEffect(() => {
    if (selectedOil && selectedFunction) {
      setIsCalculating(true);
      calculateCustomCreamPrice(selectedOil, selectedExtracts, selectedFunction, 25.00)
        .then(price => {
          setFinalPrice(price);
          setIsCalculating(false);
        })
        .catch(() => {
          setIsCalculating(false);
        });
    }
  }, [selectedOil, selectedExtracts, selectedFunction]);

  const handleProceed = () => {
    if (purchaseOption === 'cart') {
      onAddToCart(finalPrice || undefined);
    } else if (purchaseOption === 'subscription') {
      onAddToSubscription(finalPrice || undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#7d8768] mb-2 font-editorial-new">🛒 ¡Producto Creado!</h2>
        <p className="text-[#7d8768] font-audrey">¿Cómo deseas continuar?</p>
      </div>
      
      <Card className="max-w-md mx-auto bg-gradient-to-br from-[#7d8768]/10 to-[#9d627b]/10 border-[#7d8768]/20">
        <CardHeader>
          <CardTitle className="text-center text-[#7d8768] flex items-center justify-center font-editorial-new">
            <span className="mr-2">🌿</span>
            Mi Crema Botanic Care
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-[#7d8768] mb-2 flex items-center font-gilda-display">
              <span className="mr-2">🟢</span>
              Aceite Base
            </h3>
            <Badge variant="secondary" className="bg-[#7d8768]/20 text-[#7d8768]">
              {selectedOilData?.name || 'N/A'}
            </Badge>
          </div>
          
          <div>
            <h3 className="font-semibold text-[#7d8768] mb-2 flex items-center font-gilda-display">
              <span className="mr-2">🌿</span>
              Extractos Botánicos
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedExtractsData.length > 0 ? (
                selectedExtractsData.map((extract) => (
                  <Badge key={extract.id} variant="secondary" className="bg-[#9d627b]/20 text-[#9d627b]">
                    {extract.name}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">Ninguno seleccionado</span>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-[#7d8768] mb-2 flex items-center font-gilda-display">
              <span className="mr-2">✨</span>
              Función Activa
            </h3>
            <Badge variant="secondary" className="bg-[#7a7539]/20 text-[#7a7539]">
              {selectedFunctionData?.name || 'N/A'}
            </Badge>
          </div>

          <div className="pt-4 border-t border-[#7d8768]/20">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#7d8768] font-gilda-display">Precio Total:</span>
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#7d8768]" />
              ) : (
                <span className="text-2xl font-bold text-[#7d8768] font-editorial-new">
                  Q. {finalPrice?.toFixed(2) || '0.00'}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <RadioGroup value={purchaseOption} onValueChange={setPurchaseOption}>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="cart" id="cart" />
                <Label htmlFor="cart" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🛒</span>
                    <div>
                      <h3 className="font-semibold font-gilda-display">Agregar al carrito</h3>
                      <p className="text-sm text-gray-500 font-audrey">Compra única - Pagar ahora</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="subscription" id="subscription" />
                <Label htmlFor="subscription" className="flex-1 cursor-pointer">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📦</span>
                    <div>
                      <h3 className="font-semibold font-gilda-display">Agregar a mi suscripción</h3>
                      <p className="text-sm text-gray-500 font-audrey">Recibe mensualmente con descuento</p>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button 
          onClick={handleProceed}
          disabled={!purchaseOption}
          className="bg-gradient-to-r from-[#7d8768] to-[#9d627b] hover:from-[#7a7539] hover:to-[#9d627b] text-white px-8 py-3 text-lg disabled:opacity-50"
          size="lg"
        >
          {purchaseOption === 'cart' ? 'Ir al Carrito' : purchaseOption === 'subscription' ? 'Agregar a Suscripción' : 'Selecciona una opción'}
        </Button>
      </div>
    </div>
  );
};

export default PurchaseStep;