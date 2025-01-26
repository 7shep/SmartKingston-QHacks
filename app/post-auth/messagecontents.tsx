import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import supabase from './supabaseClient'; 
import NavigationBar from '../components/navigationbar'; 

const DEFAULT_PROFILE_IMAGE = 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg';

const MessageContents = () => {
    const route = useRoute();
    const { message } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select('*')
                .eq('message_id', message.id)
                .order('created_at', { ascending: false }); 

            if (commentsError) {
                console.log('Error fetching comments:', commentsError.message);
                return;
            }

            setComments(commentsData);
        };

        fetchComments();
    }, [message.id]);

    const handleAddComment = async () => {
        if (newComment.trim()) {
            const { data: user, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.log('Error fetching user:', userError.message);
                return;
            }

            const commentData = {
                message_id: message.id,
                username: user.user_metadata.username || 'Anonymous',
                comment: newComment,
                created_at: new Date().toISOString(),
                profile_image: user.user_metadata.profile_image || DEFAULT_PROFILE_IMAGE,
            };

            const { data: comment, error: commentError } = await supabase
                .from('comments')
                .insert([commentData]);

            if (commentError) {
                console.log('Error saving comment:', commentError.message);
                return;
            }

            setComments([commentData[0], ...comments]); //puts new comment to the top
            setNewComment('');
        }
    };

    const renderComment = ({ item }) => (
        <View style={styles.commentContainer}>
            <Image source={{ uri: item.profile_image }} style={styles.commentProfileImage} />
            <View style={styles.commentContent}>
                <Text style={styles.commentUsername}>{item.username}</Text>
                <Text style={styles.commentText}>{item.comment}</Text>
                <Text style={styles.commentDate}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image source={{ uri: message.profile_image }} style={styles.profileImage} />
                <View style={styles.userInfo}>
                    <Text style={styles.username}>{message.username}</Text>
                    <Text style={styles.date}>{new Date(message.created_at).toLocaleString()}</Text>
                </View>
            </View>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.content}>{message.content}</Text>
            <View style={styles.commentSection}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor="#BE97C6"
                    value={newComment}
                    onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.commentButton} onPress={handleAddComment}>
                    <Text style={styles.commentButtonText}>Post</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={comments}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderComment}
                contentContainerStyle={styles.commentsList}
            />
            <NavigationBar /> 
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#2E294E',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfo: {
        flexDirection: 'column',
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#EFBCD5',
    },
    date: {
        fontSize: 14,
        color: '#BE97C6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#EFBCD5',
        marginBottom: 10,
    },
    content: {
        fontSize: 16,
        color: '#EFBCD5',
        marginBottom: 20,
    },
    commentSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    commentInput: {
        flex: 1,
        borderColor: '#BE97C6',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        color: '#EFBCD5',
        marginRight: 10,
    },
    commentButton: {
        backgroundColor: '#8661C1',
        padding: 10,
        borderRadius: 5,
    },
    commentButtonText: {
        color: '#EFBCD5',
    },
    commentsList: {
        paddingBottom: 20,
    },
    commentContainer: {
        flexDirection: 'row',
        backgroundColor: '#4B5267',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    commentProfileImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    commentContent: {
        flex: 1,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#EFBCD5',
    },
    commentText: {
        fontSize: 14,
        color: '#EFBCD5',
        marginBottom: 5,
    },
    commentDate: {
        fontSize: 12,
        color: '#BE97C6',
    },
});

export default MessageContents;