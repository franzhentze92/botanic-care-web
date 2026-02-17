import React, { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Download,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useOrders, OrderWithItems } from '@/hooks/useDashboard';
import { useUserProfile } from '@/hooks/useDashboard';
import jsPDF from 'jspdf';
import { useQueryClient } from '@tanstack/react-query';

const InvoiceDetail: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const orderIdNumber = orderId ? parseInt(orderId) : 0;
  const { data: orders = [], isLoading } = useOrders();
  const { data: userProfile } = useUserProfile();

  const order = orders.find(o => o.id === orderIdNumber);

  // Refrescar datos cuando la página recibe foco (para ver actualizaciones del admin)
  useEffect(() => {
    const handleFocus = () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryClient]);

  const downloadPDF = () => {
    if (!invoiceRef.current || !order) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Función para agregar nueva página si es necesario
    const checkPageBreak = (requiredHeight: number) => {
      if (yPosition + requiredHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    // Header de la factura
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FACTURA', width - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Información de la empresa
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BOTANIC CARE', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Productos Naturales de Belleza', margin, yPosition);
    yPosition += 6;
    pdf.text('Guatemala', margin, yPosition);
    yPosition += 15;

    // Información del cliente
    pdf.setFont('helvetica', 'bold');
    pdf.text('FACTURAR A:', margin, yPosition);
    yPosition += 6;
    pdf.setFont('helvetica', 'normal');
    const customerName = userProfile 
      ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Cliente'
      : 'Cliente';
    pdf.text(customerName, margin, yPosition);
    yPosition += 6;
    if (userProfile?.phone) {
      pdf.text(`Teléfono: ${userProfile.phone}`, margin, yPosition);
      yPosition += 6;
    }
    yPosition += 10;

    // Detalles de la factura
    const invoiceDetailsX = width - margin - 60;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Número de Factura:', invoiceDetailsX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(order.order_number, width - margin, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Fecha:', invoiceDetailsX, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(new Date(order.created_at).toLocaleDateString('es-GT'), width - margin, yPosition, { align: 'right' });
    yPosition += 6;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Estado:', invoiceDetailsX, yPosition);
    pdf.setFont('helvetica', 'normal');
    const statusText = {
      'pending': 'Pendiente',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    }[order.status] || order.status;
    pdf.text(statusText, width - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Tabla de items
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    
    // Header de la tabla
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.rect(margin, yPosition - 8, width - 2 * margin, 8);
    pdf.text('Producto', margin + 2, yPosition - 3);
    pdf.text('Cantidad', width / 2 - 20, yPosition - 3);
    pdf.text('Precio Unit.', width / 2 + 20, yPosition - 3);
    pdf.text('Total', width - margin - 2, yPosition - 3, { align: 'right' });
    yPosition += 2;

    // Items
    pdf.setFont('helvetica', 'normal');
    order.items.forEach((item) => {
      checkPageBreak(10);
      pdf.setDrawColor(240, 240, 240);
      pdf.rect(margin, yPosition - 6, width - 2 * margin, 6);
      pdf.setFontSize(9);
      pdf.text(item.product_name.substring(0, 30), margin + 2, yPosition - 2);
      pdf.text(item.quantity.toString(), width / 2 - 20, yPosition - 2);
      pdf.text(`Q. ${item.unit_price.toFixed(2)}`, width / 2 + 20, yPosition - 2);
      pdf.text(`Q. ${item.total_price.toFixed(2)}`, width - margin - 2, yPosition - 2, { align: 'right' });
      yPosition += 8;
    });

    yPosition += 5;

    // Totales
    checkPageBreak(30);
    const totalsX = width - margin - 50;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text('Subtotal:', totalsX, yPosition);
    pdf.text(`Q. ${order.subtotal.toFixed(2)}`, width - margin, yPosition, { align: 'right' });
    yPosition += 7;
    pdf.text('Envío:', totalsX, yPosition);
    pdf.text(`Q. ${order.shipping_cost.toFixed(2)}`, width - margin, yPosition, { align: 'right' });
    yPosition += 7;
    pdf.text('Impuestos:', totalsX, yPosition);
    pdf.text(`Q. ${order.tax.toFixed(2)}`, width - margin, yPosition, { align: 'right' });
    yPosition += 7;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('TOTAL:', totalsX, yPosition);
    pdf.text(`Q. ${order.total.toFixed(2)}`, width - margin, yPosition, { align: 'right' });
    yPosition += 15;

    // Notas
    if (order.notes) {
      checkPageBreak(20);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.text('Notas:', margin, yPosition);
      yPosition += 5;
      pdf.text(order.notes, margin, yPosition);
      yPosition += 10;
    }

    // Pie de página
    const pageCount = pdf.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.text(
        'Gracias por su compra. Botanic Care - Productos Naturales de Belleza',
        width / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    // Descargar PDF
    pdf.save(`factura-${order.order_number}.pdf`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7d8768]" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2 font-editorial-new">Factura no encontrada</h2>
              <p className="text-gray-600 mb-4 font-body">La factura que buscas no existe.</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-[#7d8768] hover:bg-[#6d7660] text-white font-body">
                Volver al Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div className="flex gap-2">
              {order.tracking_number && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // Abrir enlace de rastreo
                    const trackingUrl = `https://www.google.com/search?q=track+${order.tracking_number}`;
                    window.open(trackingUrl, '_blank');
                  }}
                  className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Rastrear Envío
                </Button>
              )}
              <Button
                onClick={downloadPDF}
                className="bg-[#7d8768] hover:bg-[#6d7660] text-white font-body"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <div ref={invoiceRef} className="bg-white rounded-xl shadow-xl border-0 p-8">
            {/* Invoice Header */}
            <div className="flex justify-between items-start mb-8 pb-8 border-b">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 font-editorial-new">FACTURA</h1>
                <div className="text-gray-600 font-body">
                  <p className="font-semibold text-lg">BOTANIC CARE</p>
                  <p>Productos Naturales de Belleza</p>
                  <p>Guatemala</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2 font-gilda-display">{order.order_number}</div>
                <Badge className={`${getStatusColor(order.status)} border-0`}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 font-gilda-display flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-[#7d8768]" />
                  Facturar a:
                </h3>
                <div className="text-gray-700 font-body">
                  <p className="font-semibold">
                    {userProfile 
                      ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || 'Cliente'
                      : 'Cliente'}
                  </p>
                  {userProfile?.phone && <p>Teléfono: {userProfile.phone}</p>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 font-gilda-display flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#7d8768]" />
                  Detalles de la Factura:
                </h3>
                <div className="text-gray-700 font-body space-y-1">
                  <p><span className="font-semibold">Fecha:</span> {new Date(order.created_at).toLocaleDateString('es-GT', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p><span className="font-semibold">Número de Pedido:</span> {order.order_number}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 font-gilda-display flex items-center">
                <Package className="h-5 w-5 mr-2 text-[#7d8768]" />
                Productos:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 font-gilda-display">Producto</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 font-gilda-display">Cantidad</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 font-gilda-display">Precio Unit.</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 font-gilda-display">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900 font-gilda-display">{item.product_name}</div>
                          {item.product_sku && (
                            <div className="text-sm text-gray-500 font-body">SKU: {item.product_sku}</div>
                          )}
                        </td>
                        <td className="text-center py-4 px-4 font-body">{item.quantity}</td>
                        <td className="text-right py-4 px-4 font-body">Q. {item.unit_price.toFixed(2)}</td>
                        <td className="text-right py-4 px-4 font-semibold text-gray-900 font-gilda-display">Q. {item.total_price.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-full md:w-80 space-y-3">
                <div className="flex justify-between text-gray-700 font-body">
                  <span>Subtotal:</span>
                  <span>Q. {order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-body">
                  <span>Envío:</span>
                  <span>Q. {order.shipping_cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-body">
                  <span>Impuestos:</span>
                  <span>Q. {order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t-2 border-gray-300 font-editorial-new">
                  <span>TOTAL:</span>
                  <span>Q. {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Tracking Information */}
            {(order.tracking_number || order.estimated_delivery) && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-4 font-gilda-display flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-[#7d8768]" />
                  Información de Envío:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.tracking_number && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-900 mb-1 font-gilda-display">Número de Seguimiento</p>
                      <p className="text-lg text-blue-700 font-mono font-semibold">{order.tracking_number}</p>
                      {order.status === 'shipped' && (
                        <p className="text-xs text-blue-600 mt-2 font-body">Tu pedido está en camino</p>
                      )}
                    </div>
                  )}
                  {order.estimated_delivery && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-semibold text-green-900 mb-1 font-gilda-display">Fecha Estimada de Entrega</p>
                      <p className="text-lg text-green-700 font-semibold">
                        {new Date(order.estimated_delivery).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold text-gray-900 mb-4 font-gilda-display flex items-center">
                Estado del Pedido:
              </h3>
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(order.status)} border-0 px-4 py-2 text-sm font-semibold`}>
                  {order.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                  {order.status === 'processing' && <AlertCircle className="h-4 w-4 mr-2" />}
                  {order.status === 'shipped' && <Truck className="h-4 w-4 mr-2" />}
                  {order.status === 'delivered' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {order.status === 'cancelled' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  {getStatusText(order.status)}
                </Badge>
                {order.status === 'processing' && !order.tracking_number && (
                  <p className="text-sm text-gray-600 font-body">
                    Tu pedido está siendo procesado. Recibirás una notificación cuando sea enviado.
                  </p>
                )}
                {order.status === 'delivered' && (
                  <p className="text-sm text-green-600 font-body flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Pedido entregado exitosamente
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold text-gray-900 mb-2 font-gilda-display">Notas:</h3>
                <p className="text-gray-600 font-body">{order.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 pt-8 border-t text-center text-gray-500 text-sm font-body">
              <p>Gracias por su compra. Botanic Care - Productos Naturales de Belleza</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default InvoiceDetail;
