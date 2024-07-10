/* eslint-disable @typescript-eslint/space-before-function-paren */
/* eslint-disable import/no-extraneous-dependencies */
import { v2 as cloudinary } from 'cloudinary';

(async function() {

 
  cloudinary.config({ 
    cloud_name: 'dwdivu60a', 
    api_key: '663763194341694', 
    api_secret: 'ej3vWwWIIGOs7fL9Yt8Njisjv9U', 
  });
    


  const uploadResult = await cloudinary.uploader
    .upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
        public_id: 'shoes',
      },
    )
    .catch((error) => {
      console.log(error);
    });
    
  console.log(uploadResult);
    

  const optimizeUrl = cloudinary.url('shoes', {
    fetch_format: 'auto',
    quality: 'auto',
  });
    
  console.log(optimizeUrl);
    
  
  const autoCropUrl = cloudinary.url('shoes', {
    crop: 'auto',
    gravity: 'auto',
    width: 500,
    height: 500,
  });
    
  console.log(autoCropUrl);    
})();