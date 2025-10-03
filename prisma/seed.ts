
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sheet1_data = `Product Name,Product image,Price Range,Short Description,Tags,Categories
Management Premium PU Leather Diary,https://drive.google.com/file/d/11sbS-XW7D6BsdoMYkXkINTHFsxp2NVx-/view?usp=sharing,240 - 300/-,"Product Highlights Management Premium PU Leather Diary 2026 with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
DIRECTORS Premium Leather Diary 2026,https://drive.google.com/file/d/1YqUkhJ9YX33wuuJcH_qGCaAsZ0GIDNNZ/view?usp=sharing,172 - 195/-"Product Highlights DIRECTORS Premium Leather Diary 2026 with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Heritage Leather Executive Diary 2026,https://drive.google.com/file/d/1ntl6n5DQpoF-FkfxYO1Rs49nJHl-NWsF/view?usp=sharing,137 - 153/-"Product Highlights Heritage Leather Executive Diary 2026,with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Paipin Brown Executive Leather Diary,https://drive.google.com/file/d/1lfIN2mDTjNwAMYX1xbnPBkqkl95OTuzL/view?usp=sharing,154 - 176/-"Product Highlights Paipin Brown Executive Leather Diary with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Canvas Button Magnetic Flap Leather Diary,https://drive.google.com/file/d/1rhDrl3FfymzRq6ivf7cCR132nwrpq2JC/view?usp=sharing,167 - 185/-"Product Highlights Canvas Button Magnetic Flap Leather Diary with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Antique Cherry Leather Diary with Flap,https://drive.google.com/file/d/1tHVzu_AHastebveoMEDnEmtlqsq1b4iL/view?usp=sharing,170 - 190/-"Product Highlights Antique Cherry Leather Diary with Flap with an antique Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Signature 64 Executive Leather Diary 2026,https://drive.google.com/file/d/1Evs6YnXj5LsDz9mTvfnxG5GyvskxT10c/view?usp=sharing,140 - 180/-"Product Highlights Signature 64 Executive Leather Diary 2026, utility pockets to carry docuents, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Teera Flap Leather Diary 2026,https://drive.google.com/file/d/1FG3CCBcHAECG_aw9dZGwp8nTe9zA8Sbj/view?usp=sharing,142 - 182/- ,"Product Highlights Teera Flap Leather Diary 2026 with Flap, with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
50-50 Soft Cream Leather Premium 2026 Diary,https://drive.google.com/file/d/1F3EXl-cfHlG3thLEUBFBVeWEtkerIhRa/view?usp=sharing,146 - 174/-"Product Highlights 50-50 Soft Cream Leather Premium 2026 Diary with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Viva Sunday Full Page Leather Diary 2026,https://drive.google.com/file/d/1AJaN0Jld4JkYd5rcIC8dr1O1kAqQZRU0/view?usp=sharing,136 - 145/-"Product Highlights Viva Sunday Full Page Leather Diary 2026. with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
BORDER Brown Leather Premium 2026 Diary,https://drive.google.com/file/d/168bCQfGOxxEle6SQWacC5DKEjsyEAahK/view?usp=sharing,164 - 188/-"Product Highlights BORDER Brown Leather Premium 2026 Diary with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Grey Alder Textured Leather Diary 2026,https://drive.google.com/file/d/1clQSKUmdfErmlZaCrvYOI8DqDGgD0Zwh/view?usp=sharing,158 - 173/-"Product Highlights Grey Alder Textured Leather Diary 2026 with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Blue Ocean Leather Diary with Magnet Flap,https://drive.google.com/file/d/1yvLcOS8geNaSqOLHDTyC-hSxib-MMoTH/view?usp=sharing,155 - 185/- ,"Product Highlights Blue Ocean Leather Diary with Magnet Flap with Magnetic Flap, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Brown Premium Leather Diary 2026,https://drive.google.com/drive/u/1/folders/1HPg-9p73g3UWkgaiWxi03gr5d1Bw1Dn5,130 - 160/- ,"Product Highlights Management Premium PU Leather Diary 2026 with Magnetic Flap, utility pockets to carry docuents, beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Curve Executive Leather Diary 2026,https://drive.google.com/file/d/1iiO7OaLSKfPOEjmJdpvAEYVSTUtJF9ea/view?usp=sharing,125 - 145/- ,"Product Highlights Curve Executive Leather Diary 2026 with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Grateful Woody PU Leather Diary 2026,https://drive.google.com/file/d/1p72hOspZC6aka4d5j-PJoGh6GwY8I33u/view?usp=sharing,162 - 183/-"Product Highlights Grateful Woody PU Leather Diary 2026 with beautifully designed soft PU leather cover, sponge padded, fine premium natural shade paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (7.4 x 9.75 inches approx) Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","best leather diary, brown diary, corporate diary, executive economy diary, leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Go Green Leather Diary 2026 with Planner,https://drive.google.com/file/d/1T9jkiYLx_lEFaEU5CYz0qBRquNJsLCrD/view?usp=sharing,138 - 143/-"Product Highlights Executive Go Green theme leather planner diary beautifully designed silky soft PU leather cover, sponge padded leather, fine premium paper, wide space for your advertisement. A perfect gift for this diwali & new year. Size : B5 Executive (19 x 24.5 cms. OR 7.4 x 9.75 inches approx) Paper Quality : Fine White Premium Paper Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding Monthly Planner : Yes Month Cutting : Yes Cover Colours : One Colour cover **COD not available on this product *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","go green diary, go green leather diary, green diary, green leather diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
A5 Wooden Gold Planner Diary 2026,https://drive.google.com/file/d/109nJXVgvjbW4PzsuFNV3UUfOMH2EJQzT/view?usp=sharing,136 - 148/-"A5 Wooden Gold Planner Diary 2026 beautifully designed cover, fine fine quality white paper, monthly planner index cutting, wide space for your advertisement. A perfect gift for this Diwali & new year. Size : A5 Size (15.6 x 21.5 cms. OR 6 x 8.5 inches approx) Paper Quality : Fine Quality White Paper Page Format : Yearly dated with One Date a Page Format Cover Binding : Wooden Cover Monthly Planner : Yes Month Cutting : Yes Cover Colours : Two mix Colour cover *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","a5 diary, a5 planner diary, corporate diary, pure wood diary, wood cover dairy, wooden diary 2026","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
A5 Mobile Pocket Grey Leather Diary 2026,https://drive.google.com/file/d/1jRlChNbOtB7XZkAT1P3n9rD0ldB5vDwU/view?usp=sharing,133 - 156/-"A5 Mobile Pocket Grey Leather Diary 2026 beautifully designed soft leather cover, Moblie carrying pocket on front, pen holder loop, sponge padded, fine premium white paper, monthly planner index cutting, wide space for your advertisement. A perfect gift for this diwali & new year. Size : A5 Size (15.6 x 21.5 cms. OR 6 x 8.5 inches approx) Paper Quality : Fine White Premium Paper Page Format : Yearly dated with One Date a Page Format Cover Binding : Leather Bound with foam padding Monthly Planner : Yes Month Cutting : Yes Cover Colours : One Colour cover *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","2026 a5 diary, a5 diary, a5 leather diary, a5 planner diary, best leather diary, corporate diary, mobile pocket diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Regular Leather Engineering Diary 2026,https://drive.google.com/file/d/1f0zo8_pPOI2YT6OiRn6IR7rl9MlCwVVs/view?usp=sharing,140 - 161/-"This Regular Leather Engineering Diary is a best fit Unique Promotional Gift for Engineers, useful engineering information pages, monthly index cutting, premium leather cover with wide space for customization printing. Size : 19 x 25 cms. OR 7.5 x 10 inches (approx) Paper : Fine Premium Quality Paper Binding : Imported PU Leather Bound with Foam Padded Cover Format : One Date a Page Format Monthly Planner : Yes Month Cutting : Yes Colours : One Colour cover ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","2026 engineering diary, engineering diary, engineers diary, leather engineering diary, pu leather engineering diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
Premium Leather Engineering Diary with Planner,https://drive.google.com/file/d/1nn397dWeBk8vhfZl_HpaesKUXkCAcLHZ/view?usp=sharing,,"Premium Leather Engineering Diary with Planner is a best fit Unique Promotional Gift for Engineers, useful engineering information pages, monthly index cutting, premium leather cover with wide space for customization printing. Size : 19 x 25 cms. OR 7.5 x 10 inches (approx) Paper : Fine Premium Quality Paper Binding : Imported PU Leather Bound with Foam Padded Cover Format : One Date a Page Format Monthly Planner : Yes Month Cutting : Yes Colours : One Colour cover ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then write us.","2027 engineering diary, engineering diary, engineers diary, leather engineering diary, pu leather engineering diary","NEW YEAR DIARY , CUSTOMISED DIARY & NOTE BOOKS"
`;

const sheet2_data = `Product Name,Product image,Price Range,Short Description,Tags
,https://drive.google.com/file/d/1jRh-SQlvX_96f1D9VAsGO_bt2QiTQeOx/view?usp=sharing,,,
,https://drive.google.com/file/d/1fU33i5Y9Eq-D12468o88W-QU7Ts7jHs1/view?usp=sharing,,,
,SBI Nes 2.JPGg,,,
`;

const sheet3_data = `Product Name,Product image,Price Range,Short Description,Tags
Primo A5 Corporate Diary and Pen Set,https://drive.google.com/file/d/1UcB8Gmh4knL15Su_DsD5D0WihKEFN6pH/view?usp=sharing,225 - 255/-"Best PU Leather Diary with Pen at best price, stylish design, sober colour, handy A5 size, thick paper with monthly planner. Logo can be embossed or golden foil, you can also print your logo on the top of box and make it a unique gift set. Diary Size : A5 6 x 8.25 inches (approx) Binding : PU Leather cover bound with sponge padded Paper : Fine Quality Natural Premium Paper Colour : Rich Tenn Brown Colour Pen : Heavy duty beautiful Metal Pen ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us."," best corporate gift, best gifting ideas, customized diary with pen, diary and calendar gift set, diary and pen set, diary with pen"
Wooden A5 Corporate Diary and Pen Set,https://drive.google.com/drive/u/1/folders/1HPg-9p73g3UWkgaiWxi03gr5d1Bw1Dn5,230 - 250/- "Wooden A5 Corporate Diary and Pen Set at best price, stylish design, sober colour, handy A5 size, thick paper with monthly planner. you can also print your logo on the top of box and make it a unique gift set. Diary Size : A5 6 x 8.25 inches (approx) Binding : Wooden Cover Paper : Fine Quality White Paper Colour : Rich Tenn Brown Colour Pen : Heavy duty beautiful Metal Pen ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us."," best corporate gift, best gifting ideas, customized diary with pen, diary and calendar gift set, diary and pen set, diary with pen"
"Polo A5 Corporate Diary and Pen Set ",https://drive.google.com/file/d/11pKAL_jh7Af3IQxxa49_MIbMXOT0tx7e/view?usp=sharing,220 - 245/- "Best PU Leather Diary with Pen at best price,. stylish design, sober colour, handy A5 size, thick paper with monthly planner. Logo can be embossed or golden foil, you can also print your logo on the top of box and make it a unique gift set. Diary Size : A5 6 x 8.25 inches (approx) Binding : PU Leather cover bound with sponge padded Paper : Fine Quality Natural Premium Paper Colour : Rich Tenn Brown Colour Pen : Heavy duty beautiful Metal Pen ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us."," best corporate gift, best gifting ideas, customized diary with pen, diary and calendar gift set, diary and pen set, diary with pen"
50-50 B5 Diary Calendar with Pen Combo Set,GS 20 Diary and calendar combo a.JPGg,315 - 332/-"Best Leather Diary with Pen at best price, stylish design for table calendar, heavy duty metal pen, sober diary colour, Executive B5 size, fine and thick paper with monthly planner. Logo can be embossed or golden foil, you can also print your logo on the top of box and make it a unique gift set. Diary Size : B5 7.25 x 9.75 inches (approx) Binding : PU Leather cover bound with sponge padded Paper : Fine Quality Natural Premium Paper Calendar : Beautiful theme based table top calendar Pen : Heavy duty beautiful Metal Pen Packing : Box packing ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us."," best corporate gift, best gifting ideas, customized diary with pen, diary and calendar gift set, diary and pen set, diary with pen"
Oval Leather B5 Diary with Pen Gift Set,https://drive.google.com/file/d/1jIxlNwdi-E1f_-LyXT5eoP7g_JECd3JM/view?usp=sharing,300 - 310/-"Best Leather Diary with Pen at best price, stylish design for table calendar, heavy duty metal pen, sober diary colour, Executive B5 size, fine and thick paper with monthly planner. Logo can be embossed or golden foil, you can also print your logo on the top of box and make it a unique gift set. Diary Size : B5 7.25 x 9.75 inches (approx) Binding : PU Leather cover bound with sponge padded Paper : Fine Quality Natural Premium Paper Calendar : Beautiful theme based table top calendar Pen : Heavy duty beautiful Metal Pen Packing : Box packing ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us."," best corporate gift, best gifting ideas, customized diary with pen, diary and calendar gift set, diary and pen set, diary with pen"
ANT A5 Corporate Diary And Pen Gift Set ,GS4 Ant Gift set 2.JPG,215 - 234/- "Best PU Leather Diary with Pen at best price, stylish design, sober colour, handy A5 size,. thick paper with monthly planner. Logo can be embossed or golden foil, you can also print your logo on the top of box and make it a unique gift set. Diary Size : A5 6 x 8.25 inches (approx) Binding : PU Leather cover bound with sponge padded Paper : Fine Quality Natural Premium Paper Colour : Rich Tenn Brown Colour Pen : Heavy duty beautiful Metal Pen ” COD facility not available for this product “ *This product has minimum order quantity restriction. ** If your order quantity is little less than MOQ then please write us.","best corporate gift, best gifting ideas, customized diary with pen, diary and pen combo, diary and pen set, diary with pen"
`;

function parseCSV(csv: string): Array<{[key: string]: string}> {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^ "]*\"){2})*[^ "]*$)/);
        const obj: {[key: string]: string} = {};
        header.forEach((h, i) => {
            obj[h] = values[i] ? values[i].replace(/(^\"|\"$)/g, '').trim() : '';
        });
        return obj;
    });
}

function parsePriceRange(range: string | undefined) {
    if (!range) return { minPrice: null, maxPrice: null };
    const parts = range.replace('/-','').trim().split(' - ');
    if (parts.length === 2) {
        return {
            minPrice: parseInt(parts[0], 10) || null,
            maxPrice: parseInt(parts[1], 10) || null,
        };
    }
    return { minPrice: parseInt(parts[0], 10) || null, maxPrice: null };
}

async function main() {
  console.log('Seeding database...');
  const allData: any[] = [];

  const sheet1_parsed = parseCSV(sheet1_data);
  const sheet2_parsed = parseCSV(sheet2_data);
  const sheet3_parsed = parseCSV(sheet3_data);

  sheet1_parsed.forEach(row => {
    if (row['Product Name']) {
        const { minPrice, maxPrice } = parsePriceRange(row['Price Range']);
        allData.push({
          name: row['Product Name'],
          imageUrl: row['Product image'],
          minPrice,
          maxPrice,
          description: row['Short Description'],
          tags: row['Tags'],
          category: row['Categories'],
        });
    }
  });

  sheet2_parsed.forEach(row => {
    if (row['Product image']) { // only import if there is an image
        const { minPrice, maxPrice } = parsePriceRange(row['Price Range']);
        allData.push({
          name: row['Product Name'] || 'Unnamed Product',
          imageUrl: row['Product image'],
          minPrice,
          maxPrice,
          description: row['Short Description'],
          tags: row['Tags'],
          category: 'Unknown',
        });
    }
  });

  sheet3_parsed.forEach(row => {
    if (row['Product Name']) {
        const { minPrice, maxPrice } = parsePriceRange(row['Price Range']);
        allData.push({
          name: row['Product Name'],
          imageUrl: row['Product image'],
          minPrice,
          maxPrice,
          description: row['Short Description'],
          tags: row['Tags'],
          category: 'Gift Set', // Category is missing in sheet 3
        });
    }
  });

  for (const product of allData) {
    if (product.name && product.name.trim() !== '') {
      await prisma.product.upsert({
        where: { name: product.name },
        update: product,
        create: product,
      });
    }
  }
  console.log('Seeding complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
