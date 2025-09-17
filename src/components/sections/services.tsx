import Image from "next/image";

const servicesData = [
  {
    title: "Frequently asked questions",
    subtitle: "Updates on safe Shopping in our Stores",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e55b939fea169c0292_faq-min.png",
    bgColorClass: "bg-[#E91E63]",
    alt: "Frequently asked questions icon",
  },
  {
    title: "Online Payment Process",
    subtitle: "Updates on safe Shopping in our Stores",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e6707380718425e697_onlie%20payment-min.png",
    bgColorClass: "bg-[#D32F2F]",
    alt: "Online payment process icon",
  },
  {
    title: "Home Delivery Options",
    subtitle: "Updates on safe Shopping in our Stores",
    image: "https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e544663ba3d0fd2bb8_home%20delivery-min.png",
    bgColorClass: "bg-[#00796B]",
    alt: "Home delivery options icon",
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-background py-24">
      <div className="container">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-dark-gray mb-10">
            Services to help you shop
          </h3>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {servicesData.map((service, index) => (
            <div
              key={index}
              className={`${service.bgColorClass} rounded-2xl p-8 text-white relative overflow-hidden min-h-[220px]`}
            >
              <div className="relative z-10">
                <h4 className="text-2xl font-semibold tracking-tight">
                  {service.title}
                </h4>
                <p className="mt-2 text-base font-normal text-white/90 max-w-[200px]">
                  {service.subtitle}
                </p>
              </div>
              <Image
                src={service.image}
                alt={service.alt}
                width={140}
                height={140}
                className="absolute -bottom-4 -right-3 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;