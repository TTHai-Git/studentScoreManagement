import { signOut } from "firebase/auth";
import { auth } from "./Firebase";
import { authApi, endpoints } from "./APIs";

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

export const logOutFireBaseUser = async (dispatch, user) => {
  try {
    // Firebase logout
    await signOut(auth);

    // API logout request
    const url = endpoints["logout"](user.id);
    const res = await authApi(user.access_token).patch(url);

    if (res.status === 200) {
      dispatch({ type: "logout" }); // Update state after successful API logout
    } else {
      console.error("Logout API responded with non-200 status:", res.status);
    }
  } catch (error) {
    console.error("Error logging out from Firebase or API:", error);
  }
};
