import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Heart,
  Leaf,
  MessageCircle,
  ArrowRight
} from 'lucide-react';
import Layout from '@/components/Layout';

// Brand fonts will be loaded via CSS

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  inquiryType?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        return undefined;
      case 'email':
        if (!value.trim()) return 'El correo electrónico es requerido';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Ingresa un correo electrónico válido';
        return undefined;
      case 'phone':
        if (value && value.trim()) {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          if (!phoneRegex.test(value)) return 'Ingresa un número de teléfono válido';
        }
        return undefined;
      case 'subject':
        if (!value.trim()) return 'El asunto es requerido';
        if (value.trim().length < 5) return 'El asunto debe tener al menos 5 caracteres';
        return undefined;
      case 'message':
        if (!value.trim()) return 'El mensaje es requerido';
        if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
        return undefined;
      case 'inquiryType':
        if (!value) return 'Por favor selecciona un tipo de consulta';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate on change if field has been touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
      inquiryType: true
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Get Web3Forms access key from environment variable
      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      
      if (!accessKey) {
        console.error('Web3Forms access key is not configured. Please add VITE_WEB3FORMS_ACCESS_KEY to your .env file');
        throw new Error('Form submission is not configured. Please contact the administrator.');
      }

      // Format the message to include all form data
      const formattedMessage = `
Tipo de Consulta: ${formData.inquiryType}
Asunto: ${formData.subject}

Mensaje:
${formData.message}

${formData.phone ? `Teléfono: ${formData.phone}` : ''}
      `.trim();

      // Prepare form data for Web3Forms
      const formPayload = {
        access_key: accessKey,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject,
        message: formattedMessage,
        inquiry_type: formData.inquiryType,
        botcheck: false, // Honeypot field
        from_name: 'Botanic Care Contact Form',
        // Optional: redirect after submission
        // redirect: 'https://yourdomain.com/contact?success=true'
      };

      // Submit to Web3Forms API
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formPayload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitting(false);
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: ''
        });
        setErrors({});
        setTouched({});
        
        // Reset success message after 5 seconds
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error(result.message || 'Error al enviar el formulario');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setIsSubmitting(false);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  const officeHours = [
    { day: 'Viernes', hours: '8:00 AM - 5:00 PM' },
    { day: 'Sábado', hours: '8:00 AM - 5:00 PM' },
    { day: 'Domingo', hours: 'Cerrado' }
  ];

  const inquiryTypes = [
    'Consulta de Cuidado de la Piel',
    'Recomendaciones de Productos',
    'Formulación Personalizada',
    'Soporte de Pedidos',
    'Devoluciones y Reembolsos',
    'Consulta de Mayoreo',
    'Oportunidades de Asociación',
    'Prensa y Medios',
    'Otro'
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
        {/* Hero Section - Enhanced */}
        <section className="relative bg-[#8e421e] text-white py-24 md:py-32 overflow-hidden">
          {/* Background decorative elements - enhanced */}
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
                <div className="flex items-center gap-2 px-5 py-2.5 bg-[#7d8768]/30 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
                  <MessageCircle className="h-5 w-5 text-white/95" />
                  <Sparkles className="h-4 w-4 text-white/80" />
                  <span className="text-sm font-medium tracking-wide font-gilda-display">Apoyo Personalizado</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 font-editorial-new leading-tight tracking-tight animate-slide-in">
                Contáctanos
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-white/95 max-w-3xl mx-auto leading-relaxed font-audrey font-light mb-8">
                Nuestros expertos en cuidado natural están aquí para guiarte en tu camino hacia una piel radiante y saludable
              </p>
              <div className="flex items-center justify-center gap-6 text-white/80 text-sm font-body flex-wrap">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#313522]/30 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span>Respuesta en menos de 24 horas</span>
                </div>
                <span className="text-white/40">•</span>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#b9a035]/30 rounded-full">
                  <Leaf className="h-4 w-4" />
                  <span>Asesoría Personalizada</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-20 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form - Enhanced */}
            <div className="w-full">
              <Card className="border border-gray-200/60 shadow-xl bg-white/90 backdrop-blur-sm w-full hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8 md:p-10 lg:p-12">
                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-[#8e421e] rounded-2xl flex items-center justify-center shadow-lg">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-normal text-gray-900 font-gilda-display mb-2">Comienza Tu Viaje</h2>
                        <p className="text-gray-600 font-body">Cuéntanos sobre tus objetivos de cuidado natural</p>
                  </div>
                  </div>
                </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Honeypot field for spam protection */}
                    <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                          Tu Nombre *
                        </label>
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          onBlur={() => handleBlur('name')}
                          placeholder="Ingresa tu nombre completo"
                          className={`w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl transition-all py-3 ${
                            errors.name && touched.name ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                          }`}
                        />
                        {errors.name && touched.name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center font-body">
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                            {errors.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                          Correo Electrónico *
                        </label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          onBlur={() => handleBlur('email')}
                          placeholder="tu@email.com"
                          className={`w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl transition-all py-3 font-body ${
                            errors.email && touched.email ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                          }`}
                        />
                        {errors.email && touched.email && (
                          <p className="mt-2 text-sm text-red-600 flex items-center font-body">
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                        Teléfono <span className="text-gray-500 font-normal">(Opcional)</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        placeholder="+502 1234 5678"
                        className={`w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl transition-all py-3 font-body ${
                          errors.phone && touched.phone ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {errors.phone && touched.phone && (
                        <p className="mt-2 text-sm text-red-600 flex items-center font-body">
                          <AlertCircle className="h-4 w-4 mr-1.5" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                        ¿Cómo Podemos Ayudarte? *
                      </label>
                      <Select 
                        value={formData.inquiryType} 
                        onValueChange={(value) => handleInputChange('inquiryType', value)}
                      >
                        <SelectTrigger 
                          className={`border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl transition-all h-12 font-body ${
                            errors.inquiryType && touched.inquiryType ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                          }`}
                        >
                          <SelectValue placeholder="Selecciona el tipo de consulta" />
                        </SelectTrigger>
                        <SelectContent>
                          {inquiryTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.inquiryType && touched.inquiryType && (
                        <p className="mt-2 text-sm text-red-600 flex items-center font-body">
                          <AlertCircle className="h-4 w-4 mr-1.5" />
                          {errors.inquiryType}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                        Asunto *
                      </label>
                      <Input
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        onBlur={() => handleBlur('subject')}
                        placeholder="¿Sobre qué te gustaría hablar?"
                        className={`w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl transition-all py-3 font-body ${
                          errors.subject && touched.subject ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      {errors.subject && touched.subject && (
                        <p className="mt-2 text-sm text-red-600 flex items-center font-body">
                          <AlertCircle className="h-4 w-4 mr-1.5" />
                          {errors.subject}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3 font-body">
                        Cuéntanos Más *
                      </label>
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        onBlur={() => handleBlur('message')}
                        placeholder="Describe tus preocupaciones de la piel, objetivos, o cualquier pregunta que tengas..."
                        rows={6}
                        className={`w-full border-2 border-gray-200 focus:border-[#7d8768] focus:ring-2 focus:ring-[#7d8768]/20 rounded-xl resize-none transition-all font-body ${
                          errors.message && touched.message ? 'border-red-300 focus:border-red-400 focus:ring-red-400/20' : ''
                        }`}
                      />
                      <div className="flex justify-between items-center mt-2">
                        {errors.message && touched.message ? (
                          <p className="text-sm text-red-600 flex items-center font-body">
                            <AlertCircle className="h-4 w-4 mr-1.5" />
                            {errors.message}
                          </p>
                        ) : (
                          <span></span>
                        )}
                        <p className="text-xs text-gray-500 font-body">
                          {formData.message.length} caracteres
                        </p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#7d8768] hover:bg-[#6d7660] text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base mt-8"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          <span className="font-body">Enviando tu mensaje...</span>
                        </>
                      ) : (
                        <>
                          <Send className="mr-3 h-5 w-5" />
                          <span className="font-body">Enviar Mensaje</span>
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Notification Messages - Below Submit Button */}
                  {submitStatus === 'success' && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-sm animate-fade-in">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-green-800 font-semibold block text-lg font-body mb-2">¡Mensaje enviado exitosamente!</span>
                          <p className="text-green-700 text-sm font-body">Gracias por contactarnos. Nuestro experto en cuidado natural te responderá en menos de 24 horas.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mt-6 p-5 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl shadow-sm animate-fade-in">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-red-800 font-semibold block text-lg font-body mb-2">Algo salió mal</span>
                          <p className="text-red-700 text-sm font-body">Por favor intenta de nuevo o contáctanos directamente.</p>
                        </div>
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          </div>

            {/* Right Column - Enhanced Contact Info */}
            <div className="space-y-6">
              {/* Phone Card - Enhanced */}
              <Card className="border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#7d8768] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <Phone className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-editorial-new mb-2">Llámanos</h3>
                      <a href="tel:+50257081058" className="text-gray-700 hover:text-[#7d8768] transition-colors font-body text-lg">
                        +502 57081058
                      </a>
                      <p className="text-gray-500 text-sm mt-1 font-body">Disponible de lunes a sábado</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Card - Enhanced */}
              <Card className="border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#313522] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <Mail className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-editorial-new mb-2">Email</h3>
                      <a href="mailto:info@botanicaregt.com" className="text-gray-700 hover:text-[#7d8768] transition-colors font-body text-lg break-all">
                        info@botanicaregt.com
                      </a>
                      <p className="text-gray-500 text-sm mt-1 font-body">Respuesta en menos de 24 horas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Online Support Card - Enhanced */}
              <Card className="border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#8e421e] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <MessageCircle className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-editorial-new mb-2">Soporte Online</h3>
                      <p className="text-gray-700 font-body">Tienda 100% online</p>
                      <p className="text-gray-700 font-body">Envíos a toda Guatemala</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Card - Enhanced */}
              <Card className="border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-[#b9a035] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                      <Clock className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-editorial-new mb-3">Horarios</h3>
                      <div className="space-y-2">
                        {officeHours.map((schedule, index) => (
                          <div key={index} className="flex justify-between items-start">
                            <span className="text-gray-900 font-semibold font-body">{schedule.day}:</span>
                            <span className="text-gray-700 font-body text-right">{schedule.hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Contact; 