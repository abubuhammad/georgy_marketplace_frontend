import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Shield,
  Star,
  Clock,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface Seller {
  id: string;
  name: string;
  avatar?: string;
  phone: string;
  email: string;
  location: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  responseTime: string;
  memberSince: string;
  totalListings: number;
}

interface ContactSellerProps {
  seller: Seller;
  listingTitle: string;
  listingId: string;
  compact?: boolean;
}

export const ContactSeller: React.FC<ContactSellerProps> = ({
  seller,
  listingTitle,
  listingId,
  compact = false
}) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(seller.phone);
      setCopied(true);
      toast.success('Phone number copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy phone number');
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !senderName.trim() || !senderEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would integrate with your messaging system
    console.log('Sending message:', {
      to: seller.id,
      from: senderEmail,
      message,
      listingId,
      listingTitle
    });

    toast.success('Message sent successfully!');
    setMessage('');
    setSenderName('');
    setSenderEmail('');
    setSenderPhone('');
    setShowContactForm(false);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.startsWith('+234')) {
      return phone.replace('+234', '0').replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  if (compact) {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              {seller.avatar ? (
                <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {seller.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{seller.name}</h3>
                {seller.verified && (
                  <Shield className="w-4 h-4 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{seller.rating}</span>
                <span>({seller.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" className="flex-1" onClick={() => setShowContactForm(true)}>
              <MessageSquare className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPhone(!showPhone)}>
              <Phone className="w-4 h-4 mr-1" />
              {showPhone ? 'Hide' : 'Show'} Phone
            </Button>
          </div>

          {showPhone && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg">{formatPhoneNumber(seller.phone)}</span>
                <Button variant="ghost" size="sm" onClick={handleCopyPhone}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          Contact Seller
          {seller.verified && (
            <Badge variant="default" className="ml-2 bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seller Info */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {seller.avatar ? (
              <img src={seller.avatar} alt={seller.name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {seller.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{seller.name}</h3>
            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{seller.rating}</span>
              <span>({seller.reviewCount} reviews)</span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {seller.location}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Usually responds in {seller.responseTime}
              </div>
              <div className="text-xs text-gray-500">
                Member since {seller.memberSince} • {seller.totalListings} listings
              </div>
            </div>
          </div>
        </div>

        {/* Contact Buttons */}
        <div className="space-y-2">
          <Button 
            className="w-full" 
            onClick={() => setShowContactForm(!showContactForm)}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Send Message
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPhone(!showPhone)}
            >
              <Phone className="w-4 h-4 mr-2" />
              {showPhone ? 'Hide Phone' : 'Show Phone'}
            </Button>
            <Button variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
          </div>
        </div>

        {/* Phone Number */}
        {showPhone && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Phone Number</span>
              <Button variant="ghost" size="sm" onClick={handleCopyPhone}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="font-mono text-lg font-semibold">
              {formatPhoneNumber(seller.phone)}
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              Be cautious of scams. Never send money or personal info before meeting.
            </div>
          </div>
        )}

        {/* Contact Form */}
        {showContactForm && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold">Send a Message</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name *</label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Your Email *</label>
                <Input
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Phone (Optional)</label>
              <Input
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message *</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi, I'm interested in "${listingTitle}". Is it still available?`}
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSendMessage} className="flex-1">
                Send Message
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowContactForm(false)}
              >
                Cancel
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Your contact information will be shared with the seller.
            </div>
          </div>
        )}

        {/* Safety Notice */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Safety Tips</p>
              <ul className="text-blue-700 mt-1 space-y-1">
                <li>• Meet in a public place</li>
                <li>• Inspect the item before payment</li>
                <li>• Don't share personal financial information</li>
                <li>• Use secure payment methods</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactSeller;
