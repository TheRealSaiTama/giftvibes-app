"use client";

import Image from 'next/image';
import { useState } from 'react';
import { PolicyDrawer } from '@/components/ui/policy-drawer';

const departmentLinks = [
  "Customized Diaries",
  "New Year Diaries",
  "Diwali Gift Sets",
  "Corporate Gifts",
  "Logo Printed Diaries",
  "Promotional Items",
  "Leather Diaries",
  "Hardbound Diaries",
  "Executive Planners",
  "Desk Calendars",
  "Wall Calendars",
  "Notebook Sets",
  "Gift Hampers",
  "Bulk Orders",
];

const aboutUsLinks = [
  "About GiftVibes",
  "Our Manufacturing",
  "Quality Assurance",
  "Custom Design Process",
  "Company History",
  "Our Team",
  "Client Testimonials",
  "Bulk Order Process",
  "Design Gallery",
];

const servicesLinks = [
  "Custom Design",
  "Logo Printing",
  "Bulk Pricing",
  "Fast Delivery",
  "Sample Orders",
];

const helpLinks = [
  "Design Guidelines",
  "Order Tracking",
  "Contact Support",
  "Bulk Order Help",
  "Payment Options",
  "Delivery Info",
];

const paymentMethods = [
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce8816711ebecac46d8_stripe.png", alt: "Stripe" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce82d440b7ab84a993f_visa.png", alt: "Visa" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce8f032504012a5896b_Mastercard.png", alt: "Mastercard" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e48b497e6ce846b7ff_Amazon.png", alt: "Amazon" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1f054e419e42aca4a9a2_Klarna.png", alt: "Klarna" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1ce7c4510cf9a55828a0_PayPal.png", alt: "PayPal" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e4707380264b25e680_ApplePay.png", alt: "Apple Pay" },
  { src: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63eb1f55dc68c5ee83d0cbf8_GooglePay.png", alt: "Google Pay" },
];

const TermsOfServiceContent = () => (
  <>
    <h4>1. Acceptance of Terms</h4>
    <p>By accessing and placing an order with Gift Vibes Diaries, you confirm that you are in agreement with and bound by the terms of service contained in the Terms & Conditions outlined below. These terms apply to the entire website and any email or other type of communication between you and Gift Vibes Diaries.</p>
    <h4>2. Products & Services</h4>
    <p>We specialize in customized diaries, planners, notebooks, and corporate gift sets. All products are subject to availability. We reserve the right to discontinue any products at any time for any reason. Prices for all products are subject to change.</p>
    <h4>3. Ordering and Customization</h4>
    <p>For customized orders, you are responsible for providing accurate information and high-resolution artwork (logos, text). We will provide a digital proof for your approval before production. Production will not begin until the proof is approved. Delays in approval may affect delivery dates.</p>
    <h4>4. Intellectual Property</h4>
    <p>You represent and warrant that you have the right to use any logos, trademarks, or copyrighted material you provide for customization. You agree to indemnify Gift Vibes Diaries from any claims arising from the unauthorized use of such materials.</p>
    <h4>5. Payment</h4>
    <p>All payments are due upon completion of order. For bulk orders, a deposit may be required. We accept various payment methods as indicated on our website. Production will commence once payment or deposit is confirmed.</p>
    <h4>6. Shipping and Delivery</h4>
    <p>Delivery times are estimates and are not guaranteed. We are not responsible for delays caused by shipping carriers or customs. Risk of loss and title for all merchandise ordered on this website pass to you when the merchandise is delivered to the shipping carrier.</p>
    <h4>7. Returns and Refunds</h4>
    <p>Due to the custom nature of our products, we do not accept returns or offer refunds on customized items unless they are defective or do not match the approved proof. Please inspect your order upon receipt and contact us within 7 days if there are any issues.</p>
  </>
);

const PrivacyPolicyContent = () => (
  <>
    <h4>1. Information We Collect</h4>
    <p>We collect information you provide directly to us, such as your name, email address, shipping address, phone number, and payment information. We also collect information about your order, including any custom designs, logos, or text you upload.</p>
    <h4>2. How We Use Your Information</h4>
    <p>We use the information we collect to process your orders, communicate with you about your order status, provide customer support, and, if you opt-in, to send you marketing communications about our products and services.</p>
    <h4>3. Information Sharing</h4>
    <p>We do not sell your personal information. We may share your information with third-party service providers who perform services on our behalf, such as payment processing, order fulfillment, and shipping. These service providers are obligated to protect your information and are not authorized to use it for any other purpose.</p>
    <h4>4. Data Security</h4>
    <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>
    <h4>5. Cookies and Tracking Technologies</h4>
    <p>Our website may use cookies to enhance your experience. Cookies are small files that a site or its service provider transfers to your computer's hard drive through your Web browser that enables the sites or service providers systems to recognize your browser and capture and remember certain information.</p>
    <h4>6. Your Rights</h4>
    <p>You have the right to request access to, correction of, or deletion of your personal data. Please contact us to make such a request.</p>
  </>
);

const FooterLinkColumn = ({ title, links, doubleColumn = false }: { title: string; links: string[], doubleColumn?: boolean }) => (
  <div>
    <h3 className="text-base font-bold text-foreground mb-6">{title}</h3>
    <ul className={`space-y-5 ${doubleColumn ? 'sm:columns-2' : ''}`}>
      {links.map((link, index) => (
        <li key={index} className="break-inside-avoid">
          <a href="#" className="text-sm text-medium-gray hover:text-primary transition-colors">
            {link}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const AcceptedPayments = () => (
  <div>
    <h3 className="text-sm font-medium text-foreground mb-4 mt-8">Accepted Payments</h3>
    <div className="grid grid-cols-4 gap-3">
      {paymentMethods.map((method, index) => (
        <div key={index} className="bg-white w-[38px] h-[24px] border border-gray-200 rounded-sm flex items-center justify-center p-1">
          <Image src={method.src} alt={method.alt} width={28} height={9} className="object-contain" />
        </div>
      ))}
    </div>
  </div>
);


export default function Footer() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<React.ReactNode>(null);
  const [drawerTitle, setDrawerTitle] = useState("");

  const handleOpenDrawer = (type: 'terms' | 'privacy') => {
    if (type === 'terms') {
      setDrawerTitle("Terms of Service");
      setDrawerContent(<TermsOfServiceContent />);
    } else {
      setDrawerTitle("Privacy & Policy");
      setDrawerContent(<PrivacyPolicyContent />);
    }
    setDrawerOpen(true);
  };

  return (
    <footer className="bg-secondary pt-20 pb-[30px]">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-8">
          <div>
            <a href="#" className="inline-block mb-4">
              <Image src="/logo3.png" alt="Gift Vibes Diaries Logo" width={140} height={34} />
            </a>
            <p className="text-sm text-medium-gray leading-6">
              Leading manufacturer of premium customized diaries, corporate gifts, and promotional items. We specialize in creating unique, high-quality diaries for all occasions.
            </p>image.png
            <div className="hidden lg:block">
              <AcceptedPayments />
            </div>
          </div>

          <FooterLinkColumn title="Department" links={departmentLinks} doubleColumn />
          <FooterLinkColumn title="About us" links={aboutUsLinks} />
          <FooterLinkColumn title="Services" links={servicesLinks} />
          <FooterLinkColumn title="Help" links={helpLinks} />
        </div>
        
        <div className="block lg:hidden mt-8">
          <AcceptedPayments />
        </div>

        <div className="mt-[50px] pt-5 border-t border-border flex items-center justify-center">
          <div className="flex flex-col sm:flex-row items-center flex-wrap justify-center gap-x-5 gap-y-2">
            <button onClick={() => handleOpenDrawer('terms')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">Terms of Service</button>
            <button onClick={() => handleOpenDrawer('privacy')} className="text-sm font-medium text-foreground hover:text-primary transition-colors">Privacy & Policy</button>
            <p className="text-sm text-medium-gray text-center sm:text-left">
              All Rights Reserved by Gift Vibe Diaries © 2025 Premium Diary Manufacturing Company.
            </p>
          </div>
        </div>
      </div>
      <PolicyDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title={drawerTitle}>
        {drawerContent}
      </PolicyDrawer>
    </footer>
  );
}