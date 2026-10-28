// Image optimization script
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const https = require('https');
const { execSync } = require('child_process');

const urls = [
"https://lh3.googleusercontent.com/aida-public/AB6AXuA64lWGVUXPBta19LZOBMoSswIP7fwpQfzhji2nVAeh3POwt1e6qoGrsgnMJPLd1PakYPNsTEKg9eMXER9OcDR90k6856IUrlaNxGNwuAgvZsXcz2DhHTTI3i4G9PAnMM59Kna2FOL6_SyaLxSDVaUPguYOQ8F_Oz6DQXOJQUfTQyt_guUJxsdnAVcWXIYEyRE-g1zv0AZII36M-tT9HsDJO3IjO2vZrDlUVG9w1pPdDKZZwccw0OwExn2Cj3bdcwzAHtSENApx-UhS",
"https://lh3.googleusercontent.com/aida-public/AB6AXuAmLe9vL2z4405_aSNMLLzxgTU1pY_7GdUnNsg5v9PTDhhryVU0oGckjTBVV0toYZ5ndXeWCYCW3WQI1lgPP_czIrc6No-EvsfPOTr1OSQOv8wBw_UteijZ9yQLYnYFbsqRX42QCwyZz036Knd1FfhEH62ozvnMZnDh1-VCGnMXwAqZF4vU44kHtMuzNxWFY8aCp7-5muwzu_BT0BGmD1Pa-2dtjKBiuIjh5D-gc3IUd9ZIJvC5k07R69H56E0OLlLtD4SK6SMsm4qV",
"https://lh3.googleusercontent.com/aida-public/AB6AXuB0bDgtrKI_TUOe4hWGIwnlE62qmvdCJIb-jSQpQO7tBsLejPgvcvMUuqcxvXciCONgzXRqOXK6u3I_acK66lAwOIxSnQ19Uk9caRnFOOeqpZLvOFKtaVWPug2TmTQXbX62gfI42mKlbqww6NnWn1BfhAXoj6SFRoPAdn530TbmCzFioD_nJ5ccpZYZpot7tbt0wHGhi6co2quJGgO5wc0dnSuOy_EvqhvyIgDvm6v1GtsYh9tBhaHDs7-2w6uXgTZAtCZNt9c_aeyZ",
// … add the remaining 13 URLs here
];

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'oxy');
const TMP_DIR = path.join(__dirname, '..', 'scripts', 'tmp-oxy');

// create unique names based on URL hash (simplified)
const crypto = require('crypto');
function getName(url){
  const key = crypto.createHash('md5').update(url).digest('hex');
  return `img-${key}`;
}

async function download(url, dest){
  return new Promise((resolve, reject)=>{
    const file = fs.createWriteStream(dest);
    https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res=>{
      if(res.statusCode!==200){reject(new Error(`HTTP ${res.statusCode}`));return;}
      res.pipe(file);
      file.on('finish',()=>{file.close(()=>resolve());});
    }).on('error', err=>{fs.unlink(dest,()=>{});reject(err);});
  });
}

async function process(url){
  const name = getName(url);
  const local = path.join(TMP_DIR, name+'.png');
  await download(url, local);
  const info = await sharp(local).metadata();
  const base = path.join(OUTPUT_DIR, name);
  await sharp(local).resize(1600,1600).toFile(base+'.webp');
  await sharp(local).resize(960,960).toFile(base+'-960.webp');
  await sharp(local).resize(480,480).toFile(base+'-480.webp');
  return {name, base, info};
}

(async()=>{
  if(!fs.existsSync(TMP_DIR))fs.mkdirSync(TMP_DIR, {recursive:true});
  if(!fs.existsSync(OUTPUT_DIR))fs.mkdirSync(OUTPUT_DIR, {recursive:true});
  const results=[];
  for(const u of urls){
    try{results.push(await process(u));}catch(e){console.error('err',u,e);}
  }
  // manifest
  const manifest={};
  for(const r of results){
    const key=r.name;
    manifest[key]={
      base:`/images/oxy/${r.name}.webp`,
      width:1600,
      height:1600,
      variants:{'480':`/images/oxy/${r.name}-480.webp`, '960':`/images/oxy/${r.name}-960.webp`, '1600':`/images/oxy/${r.name}.webp`}
    };
  }
  fs.writeFileSync(path.join(__dirname,'..','public','images','oxy','manifest.json'), JSON.stringify(manifest, null,2));
  // TS export
  const tsobj=`export const images = ${JSON.stringify(manifest, null,2)} as const;\n`;

  fs.writeFileSync(path.join(__dirname,'..','src','data','images.ts'), tsobj);
  console.log('completed', results.length, 'files');
})();
