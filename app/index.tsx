import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from './signUp'; 
import SignIn from './signIn'; 
import Home from './post-auth/home';
import Profile from './post-auth/profile';
import Events from './post-auth/events';
import AddEvent from './post-auth/addevent';
import IsThisRecyclable from './post-auth/isthisrecyclable';
import MessageContents from './post-auth/messagecontents';
import NewMessage from './post-auth/newmessage';
import supabase from './post-auth/supabaseClient'; 
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';

const Stack = createStackNavigator();

const PreSignUp = ({ navigation }) => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'BlessedDay': require('../assets/fonts/BlessedDay-dylK.otf'), 
      });
      setFontsLoaded(true);
    };

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigation.navigate('Home');
      }
    };

    loadFonts();
    checkUser();
  }, []);

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  return (
    <View style={styles.container}>
      {/* Section 1: Title */}
      <View style={styles.titleSection}>
        <Text style={styles.titleText}>SmartKingston</Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={styles.newUserButton}
          onPress={() => navigation.navigate('SignUp')} 
        >
          <Text style={styles.buttonText}>New User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.existingUserButton}
          onPress={() => navigation.navigate('SignIn')} 
        >
          <Text style={styles.buttonText}>Existing User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const App = () => {
  return (
      <Stack.Navigator initialRouteName="PreSignUp">
        <Stack.Screen name="PreSignUp" component={PreSignUp} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="AddEvent" component={AddEvent} />
        <Stack.Screen name="IsThisRecyclable" component={IsThisRecyclable} />
        <Stack.Screen name="MessageContents" component={MessageContents} />
        <Stack.Screen name="NewMessage" component={NewMessage} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Events" component={Events} />
      </Stack.Navigator>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2E294E',
  },
  titleSection: {
    marginBottom: 20,
  },
  titleText: {
    fontSize: 36,
    fontFamily: 'BlessedDay', 
    color: '#EFBCD5',
  },
  buttonSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  newUserButton: {
    backgroundColor: '#18ab29',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#18ab29',
    paddingVertical: 16,
    paddingHorizontal: 31,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10, 
  },
  existingUserButton: {
    backgroundColor: '#18ab29',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#18ab29',
    paddingVertical: 16,
    paddingHorizontal: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: 'Arial', 
    textShadowColor: '#2f6627',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});