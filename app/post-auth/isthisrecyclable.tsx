import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from './supabaseClient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const GEMINI_KEY = 'AIzaSyDyN0PjggSu2ImrV5nO7rMKyOC_GxcagNE';
const GCLOUD_KEY = 'AIzaSyBFOpWbLdDCObUBV05F4ZPTGvtecJfXnMo';

const IsThisRecyclable = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [disposalResult, setDisposalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        Alert.alert(
          'Error',
          'You need to be logged in.',
          [{ text: 'OK' }],
          { cancelable: false }
        );
        navigation.navigate('SignIn');
      } else {
        setUsername(user.user_metadata.name);
      }
    };
    fetchUserProfile();
  }, []);

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permissions are required to take a photo');
    }
  };

  useEffect(() => {
    requestCameraPermissions();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permissions are required to take a photo');
      return;
    }
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      console.log(result);
  
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        console.log('Photo taken:', uri);
        setSelectedImage(uri);
        analyzeImage(uri);
      } else {
        console.log('Photo taking cancelled');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', `Failed to take photo: ${error.message}`);
    }
  };

  const selectProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async (uri) => {
    setLoading(true);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
  
    
      const visionResponse = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GCLOUD_KEY}`, {
        method: 'POST',
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'TEXT_DETECTION', maxResults: 10 }
            ]
          }]
        }),
      });
  
      const visionResult = await visionResponse.json();
      if (!visionResult.responses || !visionResult.responses[0]) {
        throw new Error('Invalid response from Google Cloud Vision API');
      }
  
      const labels = visionResult.responses[0].labelAnnotations?.map((label) => label.description) || [];
      const text = visionResult.responses[0].textAnnotations?.[0]?.description || '';
  
      console.log('Labels:', labels);
      console.log('Text:', text);
  
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this object and provide the most environmentally friendly disposal method. Object details: ${labels.join(', ')} ${text}`
            }]
          }]
        })
      });
  
      const result = await response.json();
      if (!result.candidates || !result.candidates[0]) {
        throw new Error('Invalid response from Gemini API');
      }
  
      const disposalAdvice = result.candidates[0].content.parts[0].text;
      console.log('Disposal Advice:', disposalAdvice);
  
      // condense the response with my insane prompt :O
      const condenseResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Condense the following disposal advice and remove all special characters, especially '*' Also specify which type of bin it should be put in. (ex: recycling: cardboard, plastic etc), garbage: garbage, compost, etc...  Finally
              make the response very direct. Such as, 'you should throw this aliminum pop can into the recycling bins with other pop cans. Dont be too direct with one sentence. Give about 2-5. On top of that,
              if there are multiple items, give a description on all of the items and where to throw each individual item out. This app will only be used in Kingston, Ontario, Canada
              and here we have green and blue bins.  green bin is used for food scraps, soiled paper products, and small amounts of yard waste (considered "organic" waste), while a blue bin is used for recyclable items like plastic bottles, 
              metal cans, glass jars, and cardboard, which are considered "dry" recyclable materials. If possible, please specify whether or not the item(s) should be disposed in the green/blue bin.
              Here are your parameters from the image we took:  ${disposalAdvice}`
            }]
          }]
        })
      });
  
      const condenseResult = await condenseResponse.json();
      if (!condenseResult.candidates || !condenseResult.candidates[0]) {
        throw new Error('Invalid response from Gemini API');
      }
  
      const condensedDisposalAdvice = condenseResult.candidates[0].content.parts[0].text;
      console.log('Condensed Disposal Advice:', condensedDisposalAdvice);
  
      setDisposalResult({
        item: labels[0],
        reason: condensedDisposalAdvice,
        category: 'Eco-Friendly Disposal'
      });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', `Failed to analyze image: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>SmartKingston</Text>
        <TouchableOpacity onPress={selectProfileImage}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
          )}
        </TouchableOpacity>
      </View>
      <Text style={styles.text}>Not sure where to dispose of your items? We got you covered.</Text>
      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Text style={styles.photoButtonText}>Take Photo</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator size="large" color="#8661C1" />}
      {selectedImage && (
        <View style={styles.resultWrapper}>
          <Image source={{ uri: selectedImage }} style={styles.image} />
          {disposalResult && (
            <ScrollView style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Item Detected: {disposalResult.item}</Text>
              <Text style={styles.resultText}>Disposal Method:</Text>
              <Text style={styles.resultReason}>
                {disposalResult.reason}
              </Text>
            </ScrollView>
          )}
        </View>
      )}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#EFBCD5" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person" size={24} color="#EFBCD5" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Events')}>
          <Ionicons name="calendar" size={24} color="#EFBCD5" />
          <Text style={styles.navText}>Events</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E294E',
    padding: 20,
  },
  header: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EFBCD5',
  },
  welcomeText: {
    fontSize: 18,
    color: '#BE97C6',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    color: '#EFBCD5',
  },
  resultWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 15,
    backgroundColor: '#4B5267',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navButton: {
    margin: 5,
    padding: 10,
    alignItems: 'center',
  },
  navText: {
    color: '#EFBCD5',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoButton: {
    backgroundColor: '#8661C1',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
  },
  photoButtonText: {
    color: '#EFBCD5',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BE97C6',
  },
  resultContainer: {
    backgroundColor: '#4B5267',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    maxHeight: 200,
    width: '90%',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#EFBCD5',
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EFBCD5',
    marginBottom: 5,
  },
  resultReason: {
    fontSize: 14,
    textAlign: 'center',
    color: '#BE97C6',
    marginTop: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#BE97C6',
  },
});

export default IsThisRecyclable;