import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from './supabaseClient'; // Import the configured Supabase client
import { launchCamera } from 'react-native-image-picker'; // Import the launchCamera function from react-native-image-picker
import { check, request, } from 'react-native-permissions'; // Import the necessary functions and constants from react-native-permissions

const IsThisRecyclable = () => {
    const navigation = useNavigation();
    const [username, setUsername] = useState('');
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        // Get the name of the user from Supabase, used to say Welcome, {username}
        const fetchUserProfile = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.log('Error getting user:', error.message);
                Alert.alert(
                    'Error', 
                    'You need to be logged in.', 
                    [
                        {
                            text: 'OK',
                        }
                    ],
                    { cancelable: false }
                );
                navigation.navigate('SignIn');
            } else {
                setUsername(user.user_metadata.name);
            }
        };
        fetchUserProfile();
    }, []);

    const handleTakePhoto = async () => {

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
          };
        
        // Check camera permissions
        launchCamera(options, (response) => {

            if(response.didCancel) {
                console.log('User cancelled taking photo');
            } else if (response.errorCode) {
                console.log('ImagePicker Error:', response.errorMessage);
            } else {
                let imageUri = response.uri as string || response.assests?.[0].uri as string;
                setSelectedImage(imageUri);
                console.log(imageUri);
            }
        });

    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>SmartKingston</Text>
                <Text style={styles.welcomeText}>Welcome, {username}</Text>
            </View>
            <Text style={styles.text}>Is this item recyclable? Take a picture and find out!</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                <Text style={styles.photoButtonText}>Take Photo</Text>
            </TouchableOpacity>
                {selectedImage ? <Image source={{ uri: selectedImage }} style={styles.image} /> : null}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate('Events')}>
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
        backgroundColor: '#fff',
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
        fontSize: 24,
        fontWeight: 'bold',
    },
    welcomeText: {
        fontSize: 16,
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
        margin: 10,
    },
    navBar: {
        position: 'absolute',
        bottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        padding: 10,
        backgroundColor: '#f8f8f8',
    },
    navButton: {
        margin: 5,
        padding: 10,
        backgroundColor: '#841584',
        borderRadius: 5,
    },
    navText: {
        color: '#fff',
        fontSize: 16,
    },
    photoButton: {
        backgroundColor: '#841584',
        padding: 10,
        borderRadius: 5,
        marginVertical: 20,
    },
    photoButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    image: {
        width: 200,
        height: 200,
        marginVertical: 20,
    },
});

export default IsThisRecyclable;