import { GridItem } from "@chakra-ui/react";
import { async } from "@firebase/util";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useSetRecoilState } from "recoil";
import { setErrorMap } from "zod";
import { authModalState } from "../atoms/authModalAtom";
import {
  Community,
  CommunitySnippet,
  communityState,
} from "../atoms/CommunitiesAtom";
import { auth, firestore } from "../firebase/clientApp";

//* ==================Component Use Community data
const useCommunityData = () => {
  // useState Hook For loading
  const [loading, setLoading] = useState(false);

  // router
  const router = useRouter();

  // useState hook for errors
  const [error, setError] = useState("");

  // recoil state
  const setAuthModalState = useSetRecoilState(authModalState);
  //getting user from use Auth State hook
  const [user, loadingUser] = useAuthState(auth);

  // Storing Community State Value using RECOIL HOOK
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState);

  //FUNCTION ON JOIN OR LEAVE COMMUNITY
  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    if (!user) {
      // open modal
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    setLoading(true);
    // is The user Signed in?
    // if not => open auth modal
    if (isJoined) {
      leaveCommunity(communityData.id);
      return;
    }

    joinCommunity(communityData);
  };

  //FUNCTION get Snippets Communities user joined
  const getMySnippets = async () => {
    setLoading(true);
    try {
      // get Snippets
      const snippetDocs = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      );

      const snippets = snippetDocs.docs.map((doc) => ({ ...doc.data() }));

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
      }));
      console.log("here are snippets", snippets);
    } catch (error: any) {
      console.log("getMySnippets Error", error);
      setError(error.message);
    }
    setLoading(false);
  };

  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(
        firestore,
        "communities",
        communityId as string
      );
      const communityDoc = await getDoc(communityDocRef);

      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data(),
        } as Community,
      }));
    } catch (error: any) {
      console.log("getCommunityData error", error.message);
    }
    setLoading(false);
  };

  //useEffect when user change state to show join or joined
  useEffect(() => {
    if (!user) {
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [],
      }));
      return;
    }
    getMySnippets();
  }, [user]);

  useEffect(() => {
    const { communityId } = router.query;
    if (communityId && !communityStateValue.currentCommunity) {
      getCommunityData(communityId as string);
    }
  }, [router.query, communityStateValue.currentCommunity]);

  // FUNCTION JOIN COMMUNITY
  const joinCommunity = async (communityData: Community) => {
    // firebase batch write
    // creating new community snippets
    // updating the numbers of Member{1}

    try {
      const batch = writeBatch(firestore);
      // creating new Snippet
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || "",
        isModerator: user?.uid === communityData.creatorId,
      };
      batch.set(
        doc(firestore, `user/${user?.uid}/communitySnippets`, communityData.id),
        newSnippet
      );

      batch.update(doc(firestore, "communities", communityData.id), {
        numberOfMembers: increment(1),
      });

      await batch.commit();
      // update recoil state - communityState.mySnippets

      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet],
      }));
    } catch (error: any) {
      console.log("join COmmunity Error", error);
      setError(error.message);
    }
    setLoading(false);
  };

  // FUNCTION LEAVE COMMUNITY
  const leaveCommunity = async (communityId: string) => {
    // firebase batch write
    // Deleting new community snippets
    // updating the numbers of Member {-1}
    // update recoil state - communityState.mySnippets

    try {
      const batch = writeBatch(firestore);

      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      );

      // updating the number of members
      batch.update(doc(firestore, "communities", communityId), {
        numberOfMembers: increment(-1),
      });

      await batch.commit();

      // update recoil State
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.filter((item) => {
          item.communityId !== communityId;
        }),
      }));
    } catch (error: any) {
      console.log("leave community error");
      setError(error.message);
    }
    setLoading(false);
  };

  return {
    //Return community state and functions
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading,
  };
};
export default useCommunityData;
