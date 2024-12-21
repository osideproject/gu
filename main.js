const t = Date.now();
let loaded, asset = false;

$(function() {
  $('#token_id').keyup(loadTokenAsset);
});

const loadTokenAsset = function() {
  const options = { method: 'GET', headers: { accept: '*/*', xApiKey: 'eee8eadf-046b-5f38-ba21-145d40ca278e' } };
  const address = '0x39509d8e1dd96cc8bad301ea65c75c7deb52374c';
  const token_id = $(this).val();

  fetch(`https://api.reservoir.tools/tokens/v7?tokens=${address}:${token_id}`)
    .then(response => response.json())
    //.then(response => setMainAsset(response['tokens'][0].token.imageLarge))
    .then(response => console.log(response))
    .catch(err => console.error(err));

  $('#download_button').click(function() {
    if (loaded) {
      canvas = document.getElementById('pfp');
      downloadCanvas(canvas);
    }
  });
}

const setMainAsset = function(url) {
  asset = url.replace('width=250', 'width=2400');
  console.log(url)
  loadImage();
  loaded = true;
}

const loadImage = async function() {
  canvas = await generatePfpImage();
  const dataURL = canvas.toDataURL('image/png');
  const pfp = document.getElementById('pfp');
  const ctx = pfp.getContext('2d');
  pfp.width = 1000;
  pfp.height = 1000;
  img = newImage(dataURL);
  await preload(dataURL)
  .then(function() {
    ctx.drawImage(
      img, 0, 0, 1000, 1000
    );
  });
}

const generatePfpImage = async function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  var images = [newImage(asset)];

  images.push(newImage('./images/guxmas.png'));

  canvas.width = 1000;
  canvas.height = 1000;

  return Promise.all(images.map(img => new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Failed to load image: ' + img.src));
  }))).then(() => {
    images.forEach(img => {
      ctx.drawImage(
        img, 0, 0, 1000, 1000
      );
    });
    return canvas;
  }).catch(error => {
    console.error(error);
  });
}

const loadBannerImage = function() {
  main_asset = newImage(asset);
  main_asset.crossOrigin="anonymous";
  const canvas = document.getElementById('banner_preview');
  const ctx = canvas.getContext('2d');
  canvas.width = 1500;
  canvas.height = 500;
  ctx.imageSmoothingEnabled = false;
  preload(asset)
  .then(function() {
    ctx.drawImage(
      main_asset, 0, 0
    );
    var p = ctx.getImageData(0, 0, 1, 1).data;
    var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    ctx.fillStyle = hex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      main_asset, 1000, -200, 1000, 1000
    );
    ctx.drawImage(
      main_asset, 650, 100, 500, 500
    );
    ctx.drawImage(
      main_asset, 450, 300, 250, 250
    );
    logo_url = './assets/301.png';
    logo = newImage(logo_url);
    preload(logo_url)
    .then(function() {
      ctx.drawImage(
        logo, 0, 0, 1500, 1500
      );
    });
  })
}

const preload = function(src) {
  return new Promise(function(resolve, reject) {
    const img = new Image();
    img.onload = function() {
      resolve(src);
    }
    img.onerror = function() {
      console.error('Failed to load image: ' + src);
    }
    img.src = src;
  });
}

const newImage = function(f) {
  const img = new Image();
  img.crossOrigin="anonymous";
  img.src = f;
  return img;
}

const rgbToHex = function(r, g, b) {
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

const downloadCanvas = function(canvas) {
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'image.png';
  link.click();
}

const editImage = async function(imageFile, prompt) {
    const apiKey = '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'; // actual API key
    const apiUrl = 'https://api.openai.com/v1/images';
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              prompt: 'Manipulate this image',
              image: imageFile.split(',')[1],
              n: 1,
              size: '1024x1024'
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        console.log(response); // Handle the response as needed

        // Optionally, display the generated images
        result.data.forEach(image => {
            const imgElement = new Image();
            imgElement.src = image.url; // Assuming the API returns URLs of the images
            document.body.appendChild(imgElement);
        });

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while editing the image.');
    }
}

function dataURItoBlob(dataURI) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  var byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  var ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], {type:mimeString});
}
