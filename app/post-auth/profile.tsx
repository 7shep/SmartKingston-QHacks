import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, ImageBackground } from 'react-native';
import supabase from './supabaseClient'; // Import the configured Supabase client
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_PROFILE_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'; // Default profile image URL
const CROSS_HATCH_IMAGE = 'https://www.transparenttextures.com/patterns/cross-hatch.png'; // Cross-hatch background image URL

const Profile = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(DEFAULT_PROFILE_IMAGE);

    useEffect(() => {
        // Get the email and username of the current user from Supabase
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
                setEmail(user.email);
                setUsername(user.user_metadata.display_name);
                setName(user.user_metadata.name || '');
                setBio(user.user_metadata.bio || '');
                setProfileImage(user.user_metadata.profile_image || DEFAULT_PROFILE_IMAGE);
            }
        };
        fetchUserProfile();
    }, []);

    const handleSave = async () => {
        // Handle save logic here
        const { error } = await supabase.auth.updateUser({
            data: { 
                name: name,
                bio: bio,
                profile_image: profileImage,
            },
        });
        if (error) {
            console.log('Error updating profile:', error.message);
        } else {
            console.log('Profile saved:', { name, bio, profileImage });
            navigation.navigate('Home');
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        navigation.navigate('SignIn');
    };

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
            </TouchableOpacity>
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#BE97C6"
            />
            <Text style={styles.label}>Username</Text>
            <ImageBackground source={{ uri: CROSS_HATCH_IMAGE }} style={styles.nonEditableInput}>
                <TextInput
                    style={styles.nonEditableInputText}
                    value={username}
                    placeholder={username}
                    placeholderTextColor="#BE97C6"
                    editable={false}
                />
            </ImageBackground>
            <Text style={styles.label}>Email</Text>
            <ImageBackground source={{ uri: CROSS_HATCH_IMAGE }} style={styles.nonEditableInput}>
                <TextInput
                    style={styles.nonEditableInputText}
                    value={email}
                    placeholder={email}
                    placeholderTextColor="#BE97C6"
                    editable={false}
                />
            </ImageBackground>
            <Text style={styles.label}>Bio</Text>
            <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Enter your bio"
                placeholderTextColor="#BE97C6"
                multiline
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2E294E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#EFBCD5',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#BE97C6',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 16,
        paddingHorizontal: 10,
        color: '#EFBCD5',
        backgroundColor: '#4B5267',
    },
    nonEditableInput: {
        width: '100%',
        height: 40,
        borderRadius: 10,
        marginBottom: 16,
        overflow: 'hidden',
    },
    nonEditableInputText: {
        height: '100%',
        paddingHorizontal: 10,
        color: '#EFBCD5',
        backgroundColor: 'transparent',
    },
    bioInput: {
        height: 80,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: '#BE97C6',
    },
    saveButton: {
        backgroundColor: '#8661C1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    saveButtonText: {
        color: '#EFBCD5',
        fontSize: 18,
        fontWeight: 'bold',
    },
    signOutButton: {
        backgroundColor: '#d9534f',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#d9534f',
        paddingVertical: 16,
        paddingHorizontal: 31,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20, 
    },
    signOutText: {
        color: '#EFBCD5',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default Profile;