import { Alert, AlertIcon, Flex, Icon, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { BsLink45Deg, BsMic } from "react-icons/bs";
import { BiPoll } from "react-icons/bi";
import { CgFormatBold } from "react-icons/cg";
import { IoDocumentText, IoImageOutline } from "react-icons/io5";
import TabItems from "./TabItems";
import TextInputs from "./PostForm/TextInputs";
import { User } from "firebase/auth";
import ImageUpload from "./PostForm/ImageUpload";
import { Post } from "../../atoms/PostAtom";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../firebase/clientApp";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import useSelectFile from "../../hooks/useSelectFile";
// * IMPORT ENDS ---------

//* TYPESCRIPT --------
type NewPostFormProps = {
  user: User;
  // communityId: string;
  // communityImageURL?: string;
};

export type TabItem = {
  title: string;
  icon: typeof Icon.arguments;
};

//* TYPESCRIPT ENDS -------

// * TAB FORM ARRAY -----------
const formTabs: TabItem[] = [
  {
    title: "Post",
    icon: IoDocumentText,
  },
  {
    title: "Images & Video",
    icon: IoImageOutline,
  },
  {
    title: "Link",
    icon: BsLink45Deg,
  },
  {
    title: "Poll",
    icon: BiPoll,
  },
  {
    title: "Talk",
    icon: BsMic,
  },
];

// TODO COMPONENT NEW POST FORM  -----------
const NewPostForm: React.FC<NewPostFormProps> = ({ user }) => {
  const router = useRouter();

  //* REACT HOOKS ---------
  const [selectedTab, setSelectedTab] = useState(formTabs[0]?.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // useState hook for Text Input
  const [textInputs, setTextInputs] = useState({
    title: "",
    body: "",
  });

  // Custom Hook for select File

  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile();

  //* REACT HOOK'S END -----------

  //* FUNCTION'S ----------

  //* HANDLE CREATE POST FUNCTION
  const handleCreatePost = async () => {
    const { communityId } = router.query;

    // create New post
    const newPost: Post = {
      communityId: communityId as string,
      creatorId: user.uid,
      creatorDisplayName: user.email!.split("@")[0],
      title: textInputs.title,
      numberOfComments: 0,
      body: textInputs.body,
      voteStatus: 0,
      createdAt: serverTimestamp() as Timestamp,
    };
    setLoading(true);
    // store the post in db
    try {
      const postDocRef = await addDoc(collection(firestore, "posts"), newPost);

      if (selectedFile) {
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`);
        await uploadString(imageRef, selectedFile, "data_url");
        const downloadURL = await getDownloadURL(imageRef);

        // UPDATE
        await updateDoc(postDocRef, {
          imageURL: downloadURL,
        });
      }
      // redirect to user back to community page
      router.back();
    } catch (error: any) {
      console.log("handleCreate post error", error.message);
      setError(error);
    }
    setLoading(false);
  };

  //* TEXT CHANGE FUNCTION
  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value },
    } = event;
    setTextInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // * FUNCTION'S ENDS ------

  // TODO return ----------
  return (
    <Flex direction="column" bg="white" borderRadius={4} mt={2}>
      <Flex width="100%">
        {formTabs.map((item) => (
          <TabItems
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === "Post" && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === "Images & Video" && (
          <ImageUpload
            selectedFile={selectedFile}
            onSelectImage={onSelectFile}
            setSelectedTab={setSelectedTab}
            setSelectedFile={setSelectedFile}
          />
        )}
      </Flex>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <Text mr={2}>Error Creating Post</Text>
        </Alert>
      )}
    </Flex>
  );
};

export default NewPostForm;
