import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import supabase from './supabaseClient'; 
import NavigationBar from '../components/navigationbar'; 

const DEFAULT_PROFILE_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'; // Default profile image URL

const Home = () => {
    const [messages, setMessages] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigation.navigate('SignIn');
            }
        };

        const fetchMessages = async () => {
            const { data: messagesData, error: messagesError } = await supabase
                .from('messages')
                .select('id, title, content, created_at, user_id, username');

            if (messagesError) {
                console.log('Error fetching messages:', messagesError.message);
                return;
            }

            const messagesWithDefaults = messagesData.map((message) => ({
                ...message,
                title: message.title || 'template_title',
            }));

            console.log('Fetched messages:', messagesWithDefaults);
            setMessages(messagesWithDefaults);
        };

        checkUser();
        fetchMessages();
    }, []);

    const renderMessage = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('MessageContents', { message: item })}>
            <View style={styles.messageContainer}>
                <View style={styles.contentSection}>
                    <View style={styles.messageHeader}>
                        <Image source={{ uri: item.profile_image || DEFAULT_PROFILE_IMAGE }} style={styles.profileImage} />
                        <View style={styles.userInfo}>
                            <Text style={styles.username}>{item.username}</Text>
                            <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
                        </View>
                    </View>
                    <Text style={styles.messageTitle}>{item.title}</Text>
                    <Text style={styles.messageContent} numberOfLines={3} ellipsizeMode="tail">
                        {item.content}
                    </Text>
                    <View style={styles.actionBar}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionText}>💬 Replies</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>SmartKingston</Text>
                <TouchableOpacity style={styles.newPost} onPress={() => Alert.alert('New Post')}>
                    <Text style={styles.newPostText}>New Post</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.messageList}
            />
            <NavigationBar /> 
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2E294E',
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#EFBCD5',
    },
    newPost: {
        backgroundColor: '#8661C1',
        padding: 10,
        borderRadius: 5,
    },
    newPostText: {
        color: '#EFBCD5',
    },
    messageList: {
        paddingBottom: 80,
    },
    messageContainer: {
        flexDirection: 'row',
        backgroundColor: '#4B5267',
        borderRadius: 8,
        marginVertical: 8,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    contentSection: {
        flex: 1,
        padding: 10,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    username: {
        color: '#EFBCD5',
        fontWeight: 'bold',
        marginRight: 8,
    },
    timestamp: {
        color: '#BE97C6',
        fontSize: 12,
    },
    messageTitle: {
        color: '#EFBCD5',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    messageContent: {
        color: '#EFBCD5',
        marginBottom: 8,
    },
    actionBar: {
        flexDirection: 'row',
        marginTop: 8,
    },
    actionButton: {
        marginRight: 15,
    },
    actionText: {
        color: '#BE97C6',
    },
});

export default Home;