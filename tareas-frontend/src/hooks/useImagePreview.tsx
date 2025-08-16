import { useState } from "react";

export function useImagePreview() {
  const [imagePath, setImagePath] = useState<FileList | null>(null);
  const [base64, setBase64] = useState<String | null>(null);
  const [imgURLState, setImgURLState] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const imgURL = {
    get: () => imgURLState,
    set: (value: string | null) => setImgURLState(value),
  };

  const preview = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const mimeType = files[0].type;
    if (!mimeType.match(/image\/*/)) {
      setMessage("Ingrese una imagen válida.");
      return;
    }

    setImagePath(files);

    const reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onloadend = () => {
      imgURL.set(reader.result as string); // actualizar usando setter
      setBase64(reader.result as string);
    };
  };

  const resetState = () => {
    setImagePath(null);
    imgURL.set(null);
    setBase64(null);
    setMessage("");
  };

  return {
    imagePath,
    base64,
    imgURL, // ahora con getter y setter
    message,
    preview,
    resetState,
  };
}
