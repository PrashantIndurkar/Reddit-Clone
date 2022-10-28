import React, { Ref, useRef } from "react";
import { Flex, Stack, Button, Image } from "@chakra-ui/react";

//* IMPORT END

// * TypeScript -------------
type ImageUploadProps = {
  selectedFile?: string;
  onSelectImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedTab: (value: string) => void;
  setSelectedFile: (value: string) => void;
};
// * TypeScript END ---------------

// TODO COMPONENT IMAGE UPLOAD  -----------
const ImageUpload: React.FC<ImageUploadProps> = ({
  selectedFile,
  setSelectedFile,
  setSelectedTab,
  onSelectImage,
}) => {
  //* HOOKS ----------------
  //*  useRef hook
  const selectedFileRef = useRef<HTMLInputElement>(null);

  //* HOOKS END ----------------

  // TODO return -----------
  return (
    <Flex direction="column" justify="center" align="center" width="100%">
      {selectedFile ? (
        <>
          <Image src={selectedFile} maxWidth="400px" maxHeight="400px" />
          <Stack direction="row" mt={5}>
            <Button height="28px" onClick={() => setSelectedTab("Post")}>
              Back to post
            </Button>
            <Button
              variant="outline"
              height="28px"
              onClick={() => setSelectedFile("")}
            >
              Remove
            </Button>
          </Stack>
        </>
      ) : (
        <Flex
          justify="center"
          align="center"
          p={20}
          border="1px dashed"
          borderColor="gray.200"
          width="100%"
          borderRadius={4}
        >
          <Button
            variant="outline"
            height="28px"
            onClick={() => selectedFileRef.current?.click()}
          >
            Upload
          </Button>
          <input
            type="file"
            ref={selectedFileRef}
            hidden
            onChange={onSelectImage}
          />
        </Flex>
      )}
    </Flex>
  );
};
export default ImageUpload;
