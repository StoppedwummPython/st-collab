const uuid = require("uuid")
const rest = require("@uploadcare/rest-client")
const auth = require("./uploadCareAuth")



/**
 * Opens a file selection dialog and uploads the selected file to S3.
 * @return {Promise<string>} A promise that resolves with the uploaded file name.
 */
module.exports = () => {
  return new Promise(async (resolve, reject) => {
    const alog = await require("./logging/alog")()
    alog("Upload", "Opening file selection dialog")
    // Using Uploadcare for file uploads
    const { uploadFile } = require("@uploadcare/upload-client")
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';  // Only allow image

    const onFileSelected = async event => {
      alog("Upload", "File selected")
      const file = event.target.files[0];
      file.name = `${uuid.v4()}.${file.name}`
      try {
        alog("Upload", `Uploading file: ${file.name}`)
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

        /*
        console.log((await rest.listOfFiles({}, {authSchema: auth})))
        */
        alog("Upload", `File uploaded successfully: ${result.cdnUrl}`)
        resolve(result.cdnUrl)
      } catch (e) {
        alog("Upload", `Error uploading file: ${e.message}`)
        alert(`Error:\n${e.message}`);
        reject(e)
      }
    }
    fileInput.addEventListener('change', onFileSelected)

    alog("Upload", "File selection dialog opened")

    fileInput.click();
  })
}
