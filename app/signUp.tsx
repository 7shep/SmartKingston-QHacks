import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import supabase from './post-auth/supabaseClient';

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    //const [postalCode, setPostalCode] = useState(null);

    const handleSignUp = () => {
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Username:', username);

        const { data, error } = supabase.auth.signUp({
            email: email.toLowerCase(),
            password: password,
            options: {
                data: {
                    //postalCode: postalCode,
                    display_name: username
                }
            }
        });
        if (error) {
            console.log('Error signing up:', error.message);
            return;
        } else if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            setPassword(''); 
        }    
         else {
            console.log('User signed up successfully', data);
            Alert.alert(
                'Success',
                'Welcome to SmartKingston!',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.navigate('Profile')
                    }
                ],
                { cancelable: false }
            );
        };
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>SmartKingston</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#d3d3d3"
                value={username}
                onChangeText={setUsername}
            />
                <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#d3d3d3"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#d3d3d3"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
                <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.goToSignInButton}>
            <Text style={styles.goToSignInText}>Already have an account?</Text>
            <Text style={styles.goToSignInText}>Go To Sign In</Text>
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
    signUpButton: {
        backgroundColor: '#8661C1',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20, 
    },
    signUpButtonText: {
        color: '#EFBCD5',
        fontSize: 18,
        fontWeight: 'bold',
    },
    goToSignInButton: {
        backgroundColor: '#4B5267',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    goToSignInText: {
        color: '#EFBCD5',
        fontSize: 16,
    },
});

export default SignUp;