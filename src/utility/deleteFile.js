import path from "path";
import fs from "fs";

const deleteFile = (files) => {
  if (!files || typeof files !== "object") {
    return;
  }

  Object.keys(files).forEach((field) => {
    files[field].forEach((file) => {
      const fullpath = path.join(process.cwd(), file.path);

      if (fs.existsSync(fullpath)) {
        fs.unlinkSync(fullpath);
      } else {
      }
    });
  });
};

export default deleteFile;
