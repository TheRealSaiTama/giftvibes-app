"use client";

import Image from 'next/image';
import { useState } from 'react';
import { PolicyDrawer } from '@/components/ui/policy-drawer';

// Footer link data – matches client's requested columns (excluding MegaShop)
const informationLinks = [
  { label: "About Us", action: "about" as const },
  { label: "Faq's", action: "faqs" as const },
  { label: "Privacy Policy", action: "privacy" as const },
  { label: "Terms & Conditions", action: "terms" as const },
  { label: "Shipping & Returns", action: "shipping" as const },
  { label: "Contact Us", action: "contact" as const },
];

const productLinks = [
  "Premium Diary",
  "New Year Diary",
  "Leather Planners",
  "Calendars",
  "Corporate Gift Sets",
  "Best Seller Corporate Gifts",
  "Leather Gifts",
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
    <h4>Order placing and shipping policy</h4>
    <p>You can place your order by selecting item online and adding to cart, once we receive your order our customer executive will contact you after checking current stock and send you proforma invoice against your order. PLEASE NOTE : Your order will be considered as confirmed only against your advance payment, otherwise order will not treated as confirmed. Once you make payment we put your order in process. After completion of order we dispatch your order as per discussion by you and that takes normal transit time 2-10 days according to your distance, location and geographical status.</p>
    
    <h4>Duration to Processing of order</h4>
    <p>Once we confirm your order usually it takes 5-7 days to process customisation on your order, this time may differ according to availability of ready stock, customisation required and its process, and session rush timing or other natural un-controllable circumstances. Kindly discuss itemwise process time with our customer executive before placing order.</p>
    
    <h4>Policy for Return of Order</h4>
    <p>Giftvibes.in makes its best possible effort to provide you an excellent online shopping experience. If you are still left wanting on account of any issue, we are there to help you out in whichever way we can. Yet, we do not provide the alternative to cancel or return orders as we produce personalized printed products that are customized to your requirement.</p>
    <p>Please get in touch with us at +919899223130 or send an email at support@Giftvibes.in for any further queries.</p>
    <p>We do not guarantee the color of the uploaded/attached pictures / designs as the process includes heat transfer of the images where some loss of color is always applicable.</p>
    <p>We do not guarantee the exact color of engraving / printing on any product as the color of finished product might appear different.</p>
    <p>We ship your material with 3 ways – Air | Train | Road Lorry service. Normally with road lorry service takes 5-10 working days to reach to destination.</p>
    
    <h4>Policy for Cancellation/Refund</h4>
    <p>We endeavor to deliver your order to you at the earliest. We deals in customized products so cancellation/refund is not possible after placing an order. If the order cannot be processed due to any unavoidable circumstances, we will inform you asap.</p>
    <p>Certain state laws do not allow limitations on implied warranties or the exclusion or limitation of certain damages. if these laws apply to you, some or all of the above disclaimers, exclusions, or limitations may not apply to you, and you might have additional rights.</p>
    
    <h4>If damages during shipping</h4>
    <p>We pack your ordered goods with very good packing material and send for shipping company or transporter, our control/gaurantee ceases once we handover goods to them. we cannot gaurantee any kind of damage, theft, opened or damaged boxes, defect due to mishandeling or carelessness done by them. If there is any complaints regarding this you have to complaint directly to the shipping company, you can claim compensation for that from shipping company only.</p>
    
    <h4>DISPUTES</h4>
    <p>Any dispute relating in any way to your visit to Giftvibes.in or purchase through Giftvibes.in will be settled in jurisdiction of Delhi courts only except that, to the extent you have in any manner violated or threatened to violate Giftvibes.in's intellectual property rights. Giftvibes.in may seek injunctive or other appropriate relief in any state and any court throughout India and you consent to exclusive jurisdiction and venue in such courts.</p>
    
    <h4>DISCLAIMER OF WARRANTIES AND LIMITATION OF LIABILITY</h4>
    <p>This site is provided by Giftvibes.in on an "as is" and "as available" basis. Giftvibes.in makes no representations or warranties of any kind express or implied, as to the operation of this site or the information, content, materials, or products included on this site.</p>
    <p>You expressly agree that your use of this site is at your sole risk. to the full extent permissible by applicable law, Giftvibes.in disclaims all warranties, express or implied, including, but not limited to, implied warranties of merchantability and fitness for a particular purpose.</p>
  </>
);

const PrivacyPolicyContent = () => (
  <>
    <p>Giftvibes.in recognises the importance of maintaining your privacy. We value your privacy and appreciate your trust in us. This Privacy Policy applies to current and former visitors to our website and to our online customers. By visiting and/or using our website, you agree to this Privacy Policy.</p>
    <p>This Privacy Policy explains the information practices that apply to personally identifiable information that we collect about you as an individual, when you visit and/or use our website. Any information that we collect about you while you are visiting or using our website will be handled in accordance with this Giftvibes.in Privacy Policy and will not be shared except in accordance with this Giftvibes.in Privacy Policy.</p>
    
    <h4>Information We Collect:</h4>
    <p>This section of our Privacy Policy describes the categories of information collected by Giftvibes.in You have the option not to provide information; however, withholding information may prevent you from being able to use some of our website features. Information Collected Automatically: Whenever you visit our website, we automatically collect some information about your transactions with us, and your use of our website. For example, we automatically collect your IP address, for Giftvibes.in internal use only, such as to help us diagnose problems with our server and administer our website.</p>
    
    <h4>Information You Send To Us:</h4>
    <p>If you choose to provide us with Personal Information, such as by sending us an e-mail or by filling out a form with your Personal Information and submitting it to us through our Website, we collect the Personal Information that you provide to us. For example, if you register or sign up for an account with us, we collect your name, e-mail address, telephone number and password. If you place an order with us, we collect the Personal Information that you provide to us such as your shipping, billing, and payment information.</p>
    
    <h4>Cookies and Similar Files:</h4>
    <p>Our Website uses "cookies" and files that are similar to cookies. Cookies are alphanumeric identifiers created by your browser at our request and stored in an approved and standardized place on your computer. By transferring these cookies, Giftvibes.in assigns you a unique customer code and record locater. Information about your activity on our Website can then be included in your customer record, which is stored within the Vistaprint firewall.</p>
    
    <h4>Use and Disclosure of Information:</h4>
    <p>We use the information that we collect about you to maintain, improve, and administer our website, operate our business, provide products and services that you request, administer your account, inform you about products and services that might be of interest to you, and personalise your online experience.</p>
    
    <h4>Your Choices</h4>
    <p>We offer you a variety of choices with respect to how we use and share your personal information. Sharing Information With Others: We will not share your Personal Information, such as your e-mail address or name, with unaffiliated organizations for them to use to inform you about their or other companies' products and services unless you consent to this sharing on registration.</p>
    
    <h4>Changes to this Privacy Policy:</h4>
    <p>This Privacy Policy was last modified on June 17, 2017 Giftvibes.in may revise this Privacy Policy from time to time by posting a revised Privacy Policy on our Website. We reserve the right to modify this Privacy Policy at any time, so please review it frequently.</p>
  </>
);

const AboutUsContent = () => (
  <>
    <p>"Giftvibes.in" is one of the biggest wholesaler on the web, focused on Corporate Promotional products. "Giftvibes.in" is a company incorporated under companies act 1956 having registered office at Delhi. Launched in July 1996. Certified with Delhi Stationery Association, Delhi</p>
    <p>"Giftvibes.in" offers a huge collection of Corporate Diaries and Planners, Business Organizers, Executive Diaries, Organizer Diaries, Corporate Gifts Items, Page A Day Diaries, Theme Diaries, International Diary, Diaries, Customised Without Date Diary, Wire O Bound Diaries and many more. Being a quality oriented organization, our main aim is to adhere to the consistency in quality. Thus, we have adopted strict quality testing procedures on the entire range of Corporate Gift Items offered by us. We have specialized ourselves in customizing the product as per our client's need.</p>
    <p>"Giftvibes.in" offers a wide selection, competitive prices, efficient and innovative payment systems, fast delivery* all over India at customer's doorsteps and a host of value added e-mail services. Our company has tied up with various major courier companies / road transporters for the faster delivery of the products. Giftvibes.in has a massive and loyal customer base, with vast multiple registered users at last count, and repeat orders of 60 percent.</p>
  </>
);

const ShippingReturnsContent = () => (
  <>
    <p>Please read our shipping policy carefully. In case you have any query, please send e-mail to us for further clarification.</p>
    <p>Once an order and its payment are fully received, we pack items for shipping. This is done with special care, so that they reach you in perfect condition. You are requested to fill your shipping address correctly while placing your orders and it is always advisable to provide a valid contact number. It will help us to reach you in case of wrong address problem or any other delivery related problems. The Shipping Address is where a customer wishes to receive his order. It could be his home, office or any valid address. Once a customer places an order, shipping address is stored in system which can be modified if customer wishes to send deliveries to any other address. Please Note that Total Delivery Time is = Payment Realization Time + Item Availability + Shipping Time.</p>
    <p>The International shipping is divided into 4 Zones. Each Zone has a different Freight Rates. Please find out which Zone a particular country falls into. In case your country is not listed in any of the zone, mail us at our contact us and we will try our best to help you.</p>
    
    <h4>Door delivery of product</h4>
    <p>Door delivery of any product can be done with some addtional cost by transporter/ shipping company, You have to give prior instructions to us in writing for door delivery of product with proper address and landmark.</p>
    
    <h4>Return / cancellation and exchange</h4>
    <p>We print and dispatch your order as per our commitments, but in case of delay in natural problems in printing, production, or shipping transit time, mishandelling or damage from transporter / shipping company, printing defaults or some other reason, company do not return or exchange product.</p>
    <p>We endeavor to deliver your order to you at the earliest. We deals in wholesale and order based customized products so cancellation/refund is not possible after placing an order. If the order cannot be processed due to any unavoidable circumstances. we do not provide the alternative to return orders as we produce personalized printed products that are customized to your requirement. Please get in touch with us at +919899223130 or send an email at support@Giftvibes.in for any further queries.</p>
    
    <h4>Can I have an order delivered on a particular date?</h4>
    <p>We continuously try to deliver products purchased from Giftvibes.in in best condition and in the fastest time possible. However, we can't commit on the same.</p>
    
    <h4>Domestic Shipping within India</h4>
    <p>It usually takes 3 to 6 business days to deliver consignments across India depending on the geographical location and conditions. Kindly note that delivery may take longer time in case of remote areas and where material have to be dispatched through road transport / train cargo / postal services.</p>
    
    <h4>International Shipping</h4>
    <p>You can have orders delivered around the world. It usually takes 4 to 10 business days to delivered consignments, depending on the geographical location and conditions. You'll be notified while placing your order if we're unable to ship specific items to the address you've selected. You are requested to check shipping Availability details before placing an order.</p>
    <p>Note: You may be subject to import duties and taxes on certain items, which are levied once a shipment reaches your country. Additional charges for customs clearance must be borne by you. We have no control over these charges and cannot predict what they may be. Customs policies vary widely from country to country. Additionally, when ordering from Giftvibes.in you are considered the importer of record and must comply with all laws and regulations of the country in which you are receiving the goods.</p>
  </>
);

const FAQsContent = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "What is Giftvibes.in?",
      answer: "We, \"GiftVibes.in\" are known as one of the prestigious Manufacturers, Traders and suppliers of an extensive range of Corporate Promotional, Advertising Gifts and Printing Needs. Giftvibes.in is India's largest upcoming wholesale online portal for personalized printing solutions and corporate gifting with a large collection of over 1100+ business promotion products."
    },
    {
      question: "What is your corporate office address?",
      answer: "Reach us at: 4487, Roshan Pura(Daiwara), Near Metro Station, Nai Sarak, Delhi 110006"
    },
    {
      question: "How do I get in touch with you?",
      answer: "Its very Easy! Just drop us an email at support@Giftvibes.in You can also call us at +91 9899223130 (during business hours)"
    },
    {
      question: "What is personalization, what is customisation? How can I personalize a product?",
      answer: "Simple! All you need to do is choose your product and customize it with your name/text/art/design!"
    },
    {
      question: "Should we make full payment in advance?",
      answer: "No, If your are going to customize your selected item than you can make 50% amount of your total as advance, rest balance you can make when your order get completed / processed and one day before ready for dispatch. Or If you need any item without any customisation, that case you have to make full bill amount as advance so we can dispatch your ordered item."
    },
    {
      question: "How can I Print my own logo or matter designs?",
      answer: "You can choose any product of your choice and then place your order. And send additional e mail with attachment of design at support@Giftvibes.in by writing details."
    },
    {
      question: "Does the quality / color of picture I attached appear same after it gets printed?",
      answer: "We do not guarantee the color of the uploaded/attached pictures / designs as the process includes heat transfer of the images where some loss of color is always applicable."
    },
    {
      question: "Can you guarantee the color of engraving / printing inks as shown on the products on your website?",
      answer: "We do not guarantee the exact color of engraving / printing on any product as the color of finished product might appear different."
    },
    {
      question: "How long it takes to deliver?",
      answer: "We ship your material with 3 ways – Air | Train | Road Lorry service. Normally with road lorry service takes 5-10 working days to reach to destination."
    },
    {
      question: "What is the whole process to place order and get delivery?",
      answer: "You can place your order by selecting item online and adding to cart, once we receive your order our customer executive will contact you after checking current stock and send you proforma invoice against your order. Once you make payment we put your order in process. After completion of order we dispatch your order as per discussion by you and that takes normal transit time 2-10 days according to your location and geographical status."
    }
  ];

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-gray-200 rounded-lg">
          <button
            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
          >
            <span className="font-medium text-gray-900">{faq.question}</span>
            <svg
              className={`w-5 h-5 transition-transform ${openFAQ === index ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openFAQ === index && (
            <div className="px-6 pb-4">
              <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ContactUsContent = () => (
  <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Map Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Us Here</h3>
          <div className="w-full h-[320px] rounded-xl overflow-hidden shadow-lg border-2 border-white">
            <iframe
              title="GiftVibes Location"
              src="https://www.google.com/maps?q=4487%2C%20Roshan%20Pura%28Daiwara%29%2C%20Near%20Metro%20Station%2C%20Nai%20Sarak%2C%20Delhi%20110006&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Address</h4>
                <p className="text-sm text-gray-600">4487, Roshan Pura(Daiwara), Near Metro Station, Nai Sarak, Delhi 110006</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Phone</h4>
                <p className="text-sm text-gray-600">+91 9899223130</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
        <form className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Your Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
              placeholder="John Doe" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Your Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
              placeholder="you@example.com" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white" 
              placeholder="Subject" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Your Message <span className="text-red-500">*</span></label>
            <textarea 
              className="w-full px-4 py-3 h-32 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white resize-none" 
              placeholder="Type your message here..." 
              required
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>Send Message</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
);

const FooterLinkColumn = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="text-base font-bold text-foreground mb-6">{title}</h3>
    {children}
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
  const [drawerSize, setDrawerSize] = useState<'small' | 'medium' | 'large'>('medium');
  const year = new Date().getFullYear();

  const handleOpenDrawer = (type: 'terms' | 'privacy' | 'about' | 'shipping' | 'contact' | 'faqs') => {
    if (type === 'terms') {
      setDrawerTitle("Terms & Conditions");
      setDrawerContent(<TermsOfServiceContent />);
      setDrawerSize('large');
    } else if (type === 'privacy') {
      setDrawerTitle("Privacy Policy");
      setDrawerContent(<PrivacyPolicyContent />);
      setDrawerSize('medium');
    } else if (type === 'about') {
      setDrawerTitle("About GiftVibes");
      setDrawerContent(<AboutUsContent />);
      setDrawerSize('small');
    } else if (type === 'shipping') {
      setDrawerTitle("Shipping & Returns");
      setDrawerContent(<ShippingReturnsContent />);
      setDrawerSize('large');
    } else if (type === 'contact') {
      setDrawerTitle("Contact Us");
      setDrawerContent(<ContactUsContent />);
      setDrawerSize('large');
    } else if (type === 'faqs') {
      setDrawerTitle("FAQs");
      setDrawerContent(<FAQsContent />);
      setDrawerSize('medium');
    }
    setDrawerOpen(true);
  };

  return (
    <footer className="bg-secondary pt-16 pb-[30px]">
      <div className="container">
        {/* Top – 4 columns: Contact Info, Information, Our Product, Map (no MegaShop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Contact Info */}
          <div>
            <a href="#" className="inline-block mb-6">
              <Image src="/logo3.png" alt="Gift Vibes Diaries Logo" width={140} height={34} />
            </a>
            <h3 className="text-base font-bold text-foreground mb-4">CONTACT INFO</h3>
            <ul className="space-y-4 text-sm text-medium-gray">
              <li>Ravindra Enterprises</li>
              <li>4487, Roshan Pura(Daiwara), Near Metro Station, Nai Sarak, Delhi 110006</li>
              <li>+91 9899223130</li>
              <li>support@giftvibes.in</li>
              <li>Open Time: 10:30AM - 8:00PM</li>
            </ul>
          </div>

          {/* Information */}
          <FooterLinkColumn title="INFORMATION">
            <ul className="space-y-4">
              {informationLinks.map((item, i) => (
                <li key={i}>
                  {item.action === "terms" ? (
                    <button onClick={() => handleOpenDrawer('terms')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ) : item.action === "privacy" ? (
                    <button onClick={() => handleOpenDrawer('privacy')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ) : item.action === "about" ? (
                    <button onClick={() => handleOpenDrawer('about')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ) : item.action === "shipping" ? (
                    <button onClick={() => handleOpenDrawer('shipping')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ) : item.action === "contact" ? (
                    <button onClick={() => handleOpenDrawer('contact')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  ) : (
                    <button onClick={() => handleOpenDrawer('faqs')} className="text-sm text-medium-gray hover:text-primary transition-colors">
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </FooterLinkColumn>

          {/* Our Product */}
          <FooterLinkColumn title="OUR PRODUCT">
            <ul className="space-y-4">
              {productLinks.map((label, i) => (
                <li key={i}>
                  <a href="#" className="text-sm text-medium-gray hover:text-primary transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </FooterLinkColumn>

          {/* Map */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">LOCATION</h3>
            <div className="relative w-full h-[280px] rounded-lg overflow-hidden border border-border">
              <iframe
                title="GiftVibes Location"
                src="https://www.google.com/maps?q=4487%2C%20Roshan%20Pura%28Daiwara%29%2C%20Near%20Metro%20Station%2C%20Nai%20Sarak%2C%20Delhi%20110006&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=4487%2C%20Roshan%20Pura%28Daiwara%29%2C%20Near%20Metro%20Station%2C%20Nai%20Sarak%2C%20Delhi%20110006"
              className="inline-block mt-3 text-sm text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="mt-10 pt-6 border-t border-border flex items-center justify-between flex-col gap-4 sm:flex-row">
          <p className="text-sm text-medium-gray">©{year}. All Rights Reserved.</p>
          <div className="flex items-center gap-5">
            <Image src="/footer/upi.png" alt="UPI" width={64} height={22} className="object-contain" />
            <Image src="/footer/imps.png" alt="NEFT/RTGS" width={64} height={22} className="object-contain" />
          </div>
        </div>
      </div>
      <PolicyDrawer isOpen={isDrawerOpen} onClose={() => setDrawerOpen(false)} title={drawerTitle} size={drawerSize}>
        {drawerContent}
      </PolicyDrawer>
    </footer>
  );
}