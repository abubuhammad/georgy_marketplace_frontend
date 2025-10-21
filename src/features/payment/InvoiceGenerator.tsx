import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Eye, 
  Send, 
  Printer, 
  Calendar, 
  DollarSign,
  Building,
  User,
  Mail
} from 'lucide-react';
import { Invoice, InvoiceItem } from './types';
import { advancedPaymentService } from '@/services/advancedPaymentService';
import { toast } from 'sonner';

interface InvoiceGeneratorProps {
  orderId?: string;
  onInvoiceGenerated?: (invoice: Invoice) => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ 
  orderId, 
  onInvoiceGenerated 
}) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    dueDate: '',
    items: [] as InvoiceItem[]
  });

  const generateInvoice = async () => {
    if (!orderId) {
      toast.error('Order ID is required');
      return;
    }

    setIsGenerating(true);
    try {
      const generatedInvoice = await advancedPaymentService.generateInvoice(orderId);
      setInvoice(generatedInvoice);
      onInvoiceGenerated?.(generatedInvoice);
      toast.success('Invoice generated successfully');
    } catch (error) {
      toast.error('Failed to generate invoice');
      console.error('Invoice generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadInvoice = async () => {
    if (!invoice) return;
    
    try {
      const pdfBlob = await advancedPaymentService.downloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const sendInvoiceEmail = async () => {
    if (!invoice) return;
    
    try {
      await advancedPaymentService.sendInvoiceEmail(invoice.id);
      toast.success('Invoice sent successfully');
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const printInvoice = () => {
    if (!invoice) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateInvoiceHTML(invoice));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateInvoiceHTML = (invoice: Invoice) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-info { margin-bottom: 20px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>Georgy Marketplace</h2>
          </div>
          
          <div class="company-info">
            <strong>From:</strong><br>
            Georgy Marketplace<br>
            123 Business Street<br>
            Lagos, Nigeria<br>
            support@georgymarketplace.com
          </div>
          
          <div class="invoice-details">
            <div>
              <strong>To:</strong><br>
              ${invoice.customerName}<br>
              ${invoice.customerEmail}<br>
              ${invoice.customerAddress}
            </div>
            <div>
              <strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
              <strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}<br>
              <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>
              <strong>Status:</strong> ${invoice.status}
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>₦${item.unitPrice.toFixed(2)}</td>
                  <td>₦${(item.quantity * item.unitPrice).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            <p>Subtotal: ₦${invoice.subtotal.toFixed(2)}</p>
            <p>Tax: ₦${invoice.tax.toFixed(2)}</p>
            <p>Shipping: ₦${invoice.shipping.toFixed(2)}</p>
            <p><strong>Total: ₦${invoice.total.toFixed(2)}</strong></p>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This invoice was generated automatically by Georgy Marketplace.</p>
          </div>
        </body>
      </html>
    `;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Invoice Generator
          </CardTitle>
          <CardDescription>
            Generate and manage invoices for orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!invoice ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    value={orderId || ''}
                    readOnly
                    placeholder="Enter order ID"
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              
              <Button 
                onClick={generateInvoice} 
                disabled={isGenerating || !orderId}
                className="w-full"
              >
                {isGenerating ? 'Generating...' : 'Generate Invoice'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h3>
                  <p className="text-gray-600">Order #{invoice.orderId}</p>
                </div>
                <div className="text-right">
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">From:</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">Georgy Marketplace</p>
                    <p>123 Business Street</p>
                    <p>Lagos, Nigeria</p>
                    <p>support@georgymarketplace.com</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">To:</h4>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{invoice.customerName}</p>
                    <p>{invoice.customerEmail}</p>
                    <p>{invoice.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Items</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>₦{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>₦{(item.quantity * item.unitPrice).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-80 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₦{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₦{invoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₦{invoice.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₦{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={downloadInvoice} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={printInvoice} variant="outline">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={sendInvoiceEmail} variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button onClick={() => setInvoice(null)} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate New
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
