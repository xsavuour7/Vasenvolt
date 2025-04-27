'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';

const faqs = [
  {
    question: 'How quickly can I get started with VasenVolt?',
    answer:
      'You can start monitoring your energy consumption within minutes of signing up. Our setup process is quick and straightforward.',
  },
  {
    question: 'What kind of support do you offer?',
    answer:
      'We provide 24/7 technical support through email, phone, and live chat. Our support team is always ready to help you with any questions or issues.',
  },
  {
    question: 'Can I integrate VasenVolt with my existing systems?',
    answer:
      'Yes, VasenVolt offers API access and various integration options to connect with your existing energy management systems.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. We use enterprise-grade encryption and follow strict security protocols to ensure your data is always protected.',
  },
  {
    question: 'What types of businesses do you serve?',
    answer:
      'We serve businesses of all sizes, from small offices to large enterprises, across various industries.',
  },
  {
    question: 'How does the pricing work?',
    answer:
      'Our pricing is based on the number of devices you want to monitor and the features you need. We offer flexible plans to suit different requirements.',
  },
];

export function ContactPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Contact Us</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Have questions about VasenVolt? We're here to help. Reach out to our
          team for assistance with your energy monitoring needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here"
                  className="min-h-[100px]"
                />
              </div>
              <Button className="w-full">
                Send Message
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    support@vasenvolt.com
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">
                    +1 (555) 123-4567
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    123 Energy Street, Suite 100
                    <br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Support Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM EST
                    <br />
                    Saturday - Sunday: 10:00 AM - 4:00 PM EST
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 