"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import Image from "next/image";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

const CustomDesignPage = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim() || !formValues.email.trim() || !formValues.message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("fullName", formValues.name);
      payload.append("email", formValues.email);
      payload.append("description", formValues.subject || "Custom Design Enquiry");
      payload.append("orderNotes", formValues.message);
      payload.append("phone", "");
      payload.append("quantity", "1");
      payload.append("pincode", "");
      payload.append("address", "");
      payload.append("companyName", "");
      payload.append("gst", "");
      payload.append("selectedProducts", JSON.stringify([]));

      const response = await fetch("/api/enquiry", {
        method: "POST",
        body: payload,
      });

      const result = await response.json();

      if (result?.success) {
        toast.success("Your custom design request has been sent!");
        setFormValues({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(result?.message || "Failed to send your request. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-[#0f4c5c]/15 to-[#124559]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#1a5d73]/15 to-[#2a6b80]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-[#124559]/10 to-[#4a9eb8]/15 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          {/* Thermal Logo Debossing Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-32"
          >
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/custom-design/thermal-debossing.jpg"
                  alt="Thermal Logo Debossing"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#124559] leading-tight">
                Thermal Logo Debossing
              </h1>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Debossing or blind debossing is and will continue to be the undisputed favourite among the logo debossings. It is charmingly unobtrusive, of high-quality and pleasant to the touch. Sometimes less is just exactly the right thing. Important is, above all, the production with the best tools; high-quality brass debossing stamps are created for every debossing.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed underline decoration-gray-400 underline-offset-4">
                  Please note : All trademarks, logos and brand names are the property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Colour Debossing Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-32"
          >
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#124559] leading-tight">
                Colour Debossing
              </h2>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                A colour debossing functions in a similar way to a blind debossing. The only difference: between the debossing stamp and the book there is a thin coloured foil that is transferred to the cover. Doodle works together with the leading manufacturers of debossing foils that offer a rich choice colours.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed underline decoration-gray-400 underline-offset-4">
                  Please note : All trademarks, logos and brand names are the property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/custom-design/colour-debossing.jpg"
                  alt="Colour Debossing"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Metallic Debossing Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-32"
          >
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/custom-design/metallic-debossing.jpg"
                  alt="Metallic Debossing"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#124559] leading-tight">
                Metallic Debossing
              </h2>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                Metallic debossing is also called hot foil embossing in Gold or Silver, as with this variation the heated debossing stamp is pressed on a metallic foil that becomes loose through the heat and is transferred onto the book cover. The motif lies, as with all debossings, deeper and forms a beautiful touch and also has a perfect metallic shine.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed underline decoration-gray-400 underline-offset-4">
                  Please note : All trademarks, logos and brand names are the property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Laser Cut / Punching Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-32"
          >
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#124559] leading-tight">
                Laser Cut / Punching
              </h2>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                A good alternative to stamping is the laser cut – a digitally controlled cutting technique. Compared to stamping, the laser cut is able to realise considerably more delicate motifs, stencil lettering or even grid images. This type of cover becomes exciting through the interaction of the underlying end leaves that can be printed in colour over a full-surface or with a motif. Good to know: with every additional cut, the stability of the cover decreases.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed underline decoration-gray-400 underline-offset-4">
                  Please note : All trademarks, logos and brand names are the property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
                </p>
              </div>
            </motion.div>

            {/* Right Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/custom-design/laser-cut.jpg"
                  alt="Laser Cut / Punching"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Magnetic Flap Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-32"
          >
            {/* Left Side - Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[32px] overflow-hidden shadow-2xl">
                <Image
                  src="/custom-design/magnetic-flap.jpg"
                  alt="Magnetic Flap"
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#124559] leading-tight">
                Magnetic Flap
              </h2>
              
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                All types of clasps made in metal, that are available in various shapes, sizes and colours to showcase your company logo.
              </p>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm md:text-base text-gray-600 leading-relaxed underline decoration-gray-400 underline-offset-4">
                  Please note : All trademarks, logos and brand names are the property of their respective owners. All company, product and service names used in this website are for identification purposes only. Use of these names, trademarks and brands does not imply endorsement.
                </p>
              </div>
            </motion.div>
          </motion.div>

        </div>
        
        {/* Contact Form Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative py-20 mb-0 overflow-hidden"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#CCDFFD] to-[#EEEEEE]"></div>
          
          {/* Form Card */}
          <div className="relative z-10 max-w-6xl mx-auto px-6">
              <div className="bg-white rounded-3xl shadow-xl p-12 md:p-16">
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-x-16 gap-y-8">
                  {/* Left Column */}
                  <div className="space-y-8">
                    <div>
                      <label htmlFor="name" className="block text-base font-normal text-gray-900 mb-3">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formValues.name}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-base font-normal text-gray-900 mb-3">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-base font-normal text-gray-900 mb-3">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formValues.subject}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div>
                    <label htmlFor="message" className="block text-base font-normal text-gray-900 mb-3">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={11}
                      value={formValues.message}
                      onChange={handleChange}
                      required
                      className="w-full h-[calc(100%-2rem)] px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all resize-none"
                    />
                  </div>

                  <div className="md:col-span-2 flex flex-col sm:flex-row sm:justify-end gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#124559] text-white font-semibold shadow-sm transition-all hover:bg-[#0f3d4a] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Sending..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomDesignPage;
