import React from 'react';
import Image from 'next/image';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#eaf3fb] to-[#fdf3d1]">
      <div className="mx-auto max-w-[1200px] px-[30px] pt-[130px] pb-[190px]">
        <div className="relative z-10 w-full md:w-1/2 lg:w-5/12">
          <div className="overflow-hidden">
            <h1 className="text-[80px] font-bold leading-[1.2] -tracking-[2.4px] text-[#003d29]">
              shopping and
            </h1>
          </div>
          <div className="overflow-hidden">
            <h1 className="text-[80px] font-bold leading-[1.2] -tracking-[2.4px] text-[#003d29]">
              department store.
            </h1>
          </div>
          <div className="mt-6 overflow-hidden">
            <p className="max-w-[470px] text-xl font-medium leading-8 text-[#3A3A3A]">
              Shopping is a bit of a relaxing hobby for me, which is sometimes
              troubling for the bank balance.
            </p>
          </div>
          <div className="mt-[50px]">
            <a
              href="#"
              className="inline-block rounded-full bg-[#003d29] py-5 px-11 text-base font-bold text-white transition-colors hover:bg-[#1B5E20]"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 h-full w-full lg:w-1/2">
        <div className="relative h-full w-full">
          <div className="absolute bottom-0 h-[85%] w-full">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9b930e006824963189865_bg-stage.png"
              alt="Background stage illustration"
              fill
              style={{ objectFit: 'contain', objectPosition: 'bottom' }}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          <div className="absolute left-[24%] top-[12%] h-[30%] w-[40%]">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e660afc23a10a53523_other-min.png"
              alt="Bags and shoes illustration"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 1024px) 40vw, 20vw"
            />
          </div>
          <div className="absolute left-[10%] top-[38%] h-[35%] w-[35%]">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e75b939fd1159c029e_tour-min.png"
              alt="Travel items illustration"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 1024px) 35vw, 18vw"
            />
          </div>
          <div className="absolute right-0 top-[52%] h-[40%] w-[50%]">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e9c0607f75e4aad54b94a0_ele.png"
              alt="Electronics illustration"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
          </div>
          <div className="absolute bottom-[10%] left-0 h-[25%] w-[35%]">
            <Image
              src="https://cdn.prod.website-files.com/63e857eaeaf853471d5335ff/63e8c4e7037f3b07ebcf202d_snaks-min.png"
              alt="Snacks illustration"
              fill
              style={{ objectFit: 'contain' }}
              sizes="(max-width: 1024px) 35vw, 18vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;