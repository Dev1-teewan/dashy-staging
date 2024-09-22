const CryptoJS = require("crypto-js");

const encryptData = (data: String) => {
  // Encrypt the message using the key
  return CryptoJS.AES.encrypt(
    data,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY
  ).toString();
};

const decryptData = (data: String) => {
  // Decrypt the encrypted message using the same key
  let decrypted = CryptoJS.AES.decrypt(
    data,
    process.env.NEXT_PUBLIC_ENCRYPTION_KEY
  );
  return decrypted.toString(CryptoJS.enc.Utf8);
};

export { encryptData, decryptData };
