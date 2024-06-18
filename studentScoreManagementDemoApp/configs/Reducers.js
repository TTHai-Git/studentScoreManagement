import { signOut } from "firebase/auth";
import { auth } from "./Firebase";

export const MyUserReducer = (current, action) => {
  switch (action.type) {
    case "login":
      return action.payload;
    case "logout":
      return null;
    default:
      return current;
  }
};

export const logOutFireBaseUser = async (dispatch) => {
  try {
    await signOut(auth);
    dispatch({ type: "logout" });
  } catch (error) {
    console.error("Error logging out from Firebase: ", error);
  }
};
