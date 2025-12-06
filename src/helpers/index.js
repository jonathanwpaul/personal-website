export const createBlobFromSignedUrl = async (signedUrl, blobName) => {
  const response = await fetch(signedUrl)
  const blob = await response.blob()

  const base64 = await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onloadend = () => {
      localStorage.setItem('profile-picture-base64', fr.result)
      resolve(fr.result)
    }
    fr.onerror = reject
    fr.readAsDataURL(blob)
  })

  return base64
}
