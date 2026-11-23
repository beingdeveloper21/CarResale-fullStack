import ImageKit from "imagekit";

let imagekit = null;

if (
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT &&
  !process.env.IMAGEKIT_PUBLIC_KEY.includes("your_imagekit")
) {
  try {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (err) {
    console.warn("ImageKit initialization failed:", err.message);
    imagekit = null;
  }
}

export default imagekit;