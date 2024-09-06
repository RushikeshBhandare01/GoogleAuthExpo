import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import {
  statusCodes,
  isErrorWithCode,
  GoogleSignin,
  GoogleSigninButton,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
} from "@react-native-google-signin/google-signin";
import { useEffect, useState } from "react";

GoogleSignin.configure({
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

export default function App() {
  const [userData, setUserData] = useState(null);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      console.log(" response", response);
      if (isSuccessResponse(response)) {
        setUserData({ userInfo: response.data });
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      console.log("error - ", error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        console.log("error - ", error);
        // an error that's not related to google sign in occurred
      }
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await GoogleSignin.signInSilently();
      if (isSuccessResponse(response)) {
        console.log("response", response);
        setUserData({ userInfo: response.data });
      } else if (isNoSavedCredentialFoundResponse(response)) {
        setUserData(null);
      }
    } catch (error) {
      console.log("error when current user not found ", error);
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      setUserData(null);
      await GoogleSignin.revokeAccess();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCurrentUser();
    // access token for login user
    const getToken = async () => {
      const tokens = await GoogleSignin.getTokens();
      console.log("access token tokens ", tokens);
    };
    getToken();
  }, []);

  console.log("userData ", userData);

  const renderLoginScreen = () => {
    return (
      <View style={styles.container}>
        <StatusBar color={"#000"} />

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => {
            signIn();
          }}
          // disabled={isInProgress}
        />
      </View>
    );
  };

  const renderHomeScreen = () => {
    return (
      <View style={styles.container}>
        <StatusBar color={"#000"} />
        <Text style={styles.headerText}>User Logged in Successfully </Text>
        <View>
          <Text>name - {userData?.userInfo?.user?.name ?? ""}</Text>
          <Text>id - {userData?.userInfo?.user?.id ?? ""}</Text>
          <Text>Email - {userData?.userInfo?.user?.email ?? ""}</Text>
        </View>
        <View>
          <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
            <Text style={styles.signOutBtnText}>Sign-Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // redirect to screen based on this value

  if (userData == null) {
    return renderLoginScreen();
  }
  return renderHomeScreen();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "semibold",
    marginBottom: 20,
  },
  signOutBtn: {
    width: 100,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  signOutBtnText: {
    color: "#fff",
  },
});
