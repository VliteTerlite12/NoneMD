const axios = require('axios');

async function pinterest(text, limit = 30) {
  try {
    const url = `https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(text)}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${encodeURIComponent(text)}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=${Date.now()}`;

    const { data } = await axios.get(url);
    
    const imageUrls = data.resource_response.data.results
      .map(result => result.images.orig.url)
      .slice(0, limit);

    return { images: imageUrls };
  } catch (error) {
    console.error('Error in functionPin:', error);
    throw new Error('Terjadi kesalahan saat mencari gambar Pinterest.');
  }
}

module.exports = pinterest;