import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import supabase from './post-auth/supabaseClient';
import * as Font from 'expo-font';
import AppLoading from 'expo-app-loading';



const SignIn = ({ navigation }: Props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSignIn = async () => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(),
                password: password,
            });

            if (error) {
                console.log('Error signing in:', error.message);
                Alert.alert('Error', 'Invalid email or password');
                return;
            } else {
                console.log('User signed in successfully:', data);
                navigation.navigate('Home');
            }
        } catch (err) {
            console.error('Unexpected error during sign in:', err);
            Alert.alert('Error', 'An unexpected error occurred');
        }
    };

    const handleGoToSignUp = () => {
        navigation.navigate('SignUp');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In To SmartKingston</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#BE97C6"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#BE97C6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goToSignUpButton} onPress={handleGoToSignUp}>
                <Text style={styles.goToSignUpText}>Don't have an account?</Text>
                <Text style={styles.goToSignUpText}>Go To Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E294E',
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 16,
        textAlign: 'center',
        color: '#EFBCD5',
        fontFamily: 'BlessedDay', 
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: '#BE97C6',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        color: '#EFBCD5',
    },
    signInButton: {
        backgroundColor: '#8661C1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20, 
    },
    signInButtonText: {
        color: '#EFBCD5',
        fontSize: 18,
        fontWeight: 'bold',
    },
    goToSignUpButton: {
        backgroundColor: '#4B5267',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    goToSignUpText: {
        color: '#EFBCD5',
        fontSize: 16,
    },
});

export default SignIn;