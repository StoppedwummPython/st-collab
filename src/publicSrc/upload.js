const uuid = require("uuid")

/**
 * Opens a file selection dialog and uploads the selected file to S3.
 * @return {Promise<string>} A promise that resolves with the uploaded file name.
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    const { uploadFile } = require("@uploadcare/upload-client")
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';  // Only allow image

    const onFileSelected = async event => {
      const file = event.target.files[0];
      file.name = `${uuid.v4()}.${file.name}`
      try {
        const result = await uploadFile(
          file,
          {
            publicKey: '5f2f3bbc20f0181e14a8',
            store: 'auto',
            metadata: {
              "type": "image",
              "uploadedBy": localStorage.getItem("username"),
              "channel": localStorage.getItem("joinCode"),
              "client": "mainStCollab"
            }
          }
        )
        resolve(result.cdnUrl)
      } catch (e) {
        alert(`Error:\n${e.message}`);
        reject(e)
      }
    }
    fileInput.addEventListener('change', onFileSelected)

    fileInput.click();
  })
}
