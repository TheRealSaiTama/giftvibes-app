import Image from "next/image";

const servicesData = [
  {
    title: "Custom Design Services",
    subtitle: "Professional diary design and customization solutions",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55b939fea169c0292_faq-min.png",
    bgColorClass: "bg-[#124559]",
    alt: "Custom design services icon",
  },
  {
    title: "Bulk Order Solutions",
    subtitle: "Special pricing and services for corporate orders and expertise in handling bulk order",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6707380718425e697_onlie%20payment-min.png",
    bgColorClass: "bg-[#2c3e50]",
    alt: "Bulk order solutions icon",
  },
  {
    title: "Fast Delivery",
    subtitle: "Quick turnaround for all diary orders nationwide",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e544663ba3d0fd2bb8_home%20delivery-min.png",
    bgColorClass: "bg-[#1a5d73]",
    alt: "Fast delivery options icon",
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-dark-gray mb-10">
            Our Premium Services
          </h3>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className={`group ${service.bgColorClass} rounded-2xl p-8 text-white relative overflow-hidden min-h-[220px] transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-black/25`}
            >
              <div className="relative z-10">
                <h4 className="text-2xl font-semibold tracking-tight">
                  {service.title}
                </h4>
                <p className="mt-2 text-base font-normal text-white/90 max-w-[200px]">
                  {service.subtitle}
                </p>
              </div>

              {/* Circular image window */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full overflow-hidden transition-all duration-500 ease-in-out group-hover:scale-110">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-125"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;