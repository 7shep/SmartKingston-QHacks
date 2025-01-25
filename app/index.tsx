import React, { useEffect, useRef, useState } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import SignUp from './signUp'; // Import the SignUp component
import SignIn from './signIn'; // Import the SignIn component
import Home from './post-auth/home'; // Import the Home component
import Profile from './post-auth/profile'; // Import the Profile component
import Events from './post-auth/events'; // Import the Events component
import AddEvent from './post-auth/addevent'; // Import the AddEvent component
import IsThisRecyclable from './post-auth/isthisrecyclable'; // Import the IsThisRecyclable component

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Section 1: Title */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>SmartKingston</Text>
      </View>

      {/* Button Section */}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.newUserButton}
          onPress={() => navigation.navigate('SignUp')} // Navigate to SignUp
        >
          <Text style={styles.buttonText}>New User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.existingUserButton}
          onPress={() => navigation.navigate('SignIn')} // Navigate to SignIn
        >
          <Text style={styles.buttonText}>Existing User</Text>
        </TouchableOpacity>
      </View>

      {/* Section 3: AI Logo */}
      <View style={styles.logoSection}>
        <Image
          source={{ uri: "https://via.placeholder.com/150" }} // Placeholder image
          style={styles.logo}
        />
      </View>
    </View>
  );
};

const App = () => {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [channels, setChannels] = useState<Notifications.NotificationChannel[]>([]);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
      <Stack.Navigator initialRouteName="PreSignUp">
        <Stack.Screen name="PreSignUp" component={HomeScreen} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Events" component={Events} />
        <Stack.Screen name="AddEvent" component={AddEvent} />
        <Stack.Screen name="IsThisRecyclable" component={IsThisRecyclable} />
      </Stack.Navigator>
  );
};

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('myNotificationChannel', {
      name: 'A channel is needed for the permissions prompt to appear',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  newUserButton: {
    backgroundColor: "#18ab29",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#18ab29",
    paddingVertical: 16,
    paddingHorizontal: 31,
    alignItems: "center",
    justifyContent: "center",
  },
  existingUserButton: {
    backgroundColor: "#18ab29",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#18ab29",
    paddingVertical: 16,
    paddingHorizontal: 31,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontFamily: "Arial", // Use a system font or custom font
    textShadowColor: "#2f6627",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoSection: {
    marginTop: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
});