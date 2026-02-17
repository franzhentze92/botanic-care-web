import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ShoppingCart, Package, CheckCircle, Sparkles, Leaf, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useCustomOils, useCustomExtracts, useCustomFunctions } from '@/hooks/useCustomCream';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import SummaryStep from './SummaryStep';
import PurchaseStep from './PurchaseStep';

const BotanicCareApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOil, setSelectedOil] = useState('');
  const [selectedExtracts, setSelectedExtracts] = useState<string[]>([]);
  const [selectedFunction, setSelectedFunction] = useState('');
  const [creamPrice, setCreamPrice] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { data: oils = [] } = useCustomOils();
  const { data: extracts = [] } = useCustomExtracts();
  const { data: functions = [] } = useCustomFunctions();

  const handleToggleExtract = (extract: string) => {
    setSelectedExtracts(prev => {
      if (prev.includes(extract)) {
        return prev.filter(e => e !== extract);
      } else if (prev.length < 2) {
        return [...prev, extract];
      }
      return prev;
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedOil !== '';
      case 2: return selectedExtracts.length > 0;
      case 3: return selectedFunction !== '';
      default: return true;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateCream = async () => {
    // Aquí podrías guardar la crema en Supabase si lo deseas
    // Por ahora solo avanzamos al paso de compra
    setCurrentStep(5);
  };

  const handleAddToCart = (price?: number) => {
    const finalPrice = price || creamPrice || 0;
    
    // Obtener información de los componentes seleccionados
    const selectedOilData = oils.find(o => o.id === selectedOil);
    const selectedExtractsData = extracts.filter(e => selectedExtracts.includes(e.id));
    const selectedFunctionData = functions.find(f => f.id === selectedFunction);
    
    // Crear nombre descriptivo de la crema
    const oilName = selectedOilData?.name || 'Aceite seleccionado';
    const functionName = selectedFunctionData?.name || 'Función activa';
    const extractNames = selectedExtractsData.map(e => e.name).join(', ');
    const creamName = `Crema Personalizada - ${oilName}${extractNames ? ` + ${extractNames}` : ''} (${functionName})`;
    
    // Crear un ID único para esta crema personalizada (usando timestamp + ingredientes)
    // Usar Math.floor para asegurar que sea un número entero
    const customCreamId = Math.floor(Date.now() + Math.random() * 1000);
    
    // Crear objeto Product compatible con el carrito
    const customCreamProduct = {
      id: customCreamId,
      name: creamName,
      price: finalPrice,
      originalPrice: null,
      image: '🌿',
      realImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
      size: '50ml',
      sku: `CUSTOM-${selectedOil}-${selectedFunction}-${Date.now()}`,
    };
    
    // Agregar al carrito (la notificación se muestra automáticamente en CartContext)
    addToCart(customCreamProduct, 1);
  };

  const handleAddToSubscription = (price?: number) => {
    const finalPrice = price || creamPrice || 0;
    
    toast.success('¡Agregada a tu suscripción! 📦💚', {
      description: (
        <div className="space-y-1">
          <p className="font-semibold">Tu crema personalizada será enviada mensualmente</p>
          <p className="text-sm opacity-90">Precio: <span className="font-bold">Q. {finalPrice.toFixed(2)}/mes</span></p>
          <p className="text-xs opacity-75">Con descuento especial para suscriptores</p>
        </div>
      ),
      icon: <Package className="h-6 w-6 text-[#9d627b]" />,
      duration: 6000,
      action: {
        label: 'Ver suscripciones',
        onClick: () => {
          window.location.href = '/dashboard';
        },
      },
    });
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div>
      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-br from-[#7d8768] via-[#8d756e] to-[#7a7539] text-white py-20 md:py-24 overflow-hidden w-full">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
          {/* Subtle botanical pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                <Sparkles className="h-5 w-5 text-white/95" />
                <Leaf className="h-4 w-4 text-white/80" />
                <span className="text-sm font-medium tracking-wide font-audrey">Constructor Personalizado</span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 font-editorial-new leading-tight tracking-tight animate-slide-in">
              Crea Tu Crema Facial
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed font-audrey font-light mb-8">
              Diseña tu crema facial personalizada con ingredientes 100% naturales
            </p>
            {/* Progress Bar */}
            <div className="max-w-2xl mx-auto mt-12">
              <div className="mb-4 flex items-center justify-between text-sm font-audrey">
                <span className="text-white/90">Progreso</span>
                <span className="text-white/90">Paso {currentStep} de 5</span>
              </div>
              <Progress 
                value={progress} 
                className="w-full h-3 bg-white/20 border border-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Enhanced */}
      <section className="-mt-12 relative z-20 px-4 sm:px-6 lg:px-8 pb-20 max-w-6xl mx-auto">
        <Card className="shadow-xl border border-gray-200/60 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 md:p-10 lg:p-12">
            {currentStep === 1 && (
              <StepOne 
                selectedOil={selectedOil} 
                onSelectOil={setSelectedOil} 
              />
            )}
            {currentStep === 2 && (
              <StepTwo 
                selectedExtracts={selectedExtracts} 
                onToggleExtract={handleToggleExtract} 
              />
            )}
            {currentStep === 3 && (
              <StepThree 
                selectedFunction={selectedFunction} 
                onSelectFunction={setSelectedFunction} 
              />
            )}
            {currentStep === 4 && (
              <SummaryStep 
                selectedOil={selectedOil}
                selectedExtracts={selectedExtracts}
                selectedFunction={selectedFunction}
                onCreateCream={handleCreateCream}
              />
            )}
            {currentStep === 5 && (
              <PurchaseStep 
                selectedOil={selectedOil}
                selectedExtracts={selectedExtracts}
                selectedFunction={selectedFunction}
                onAddToCart={handleAddToCart}
                onAddToSubscription={handleAddToSubscription}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation - Enhanced */}
        <div className="flex justify-between items-center mt-8 gap-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1 || currentStep === 5}
            className="border-2 border-gray-300 text-gray-700 hover:border-[#7d8768] hover:text-[#7d8768] hover:bg-[#7d8768]/5 px-8 py-3 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-audrey">Anterior</span>
          </Button>
          
          {currentStep < 4 && (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-[#7d8768] to-[#8d756e] hover:from-[#6d7660] hover:to-[#7d655e] text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-audrey">Siguiente</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default BotanicCareApp;