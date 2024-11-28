import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const saveCommentsToStorage = async (postId, comments) => {
  try {
    const allComments = JSON.parse(await AsyncStorage.getItem('allComments')) || {};
    allComments[postId] = comments;
    await AsyncStorage.setItem('allComments', JSON.stringify(allComments));
  } catch (error) {
    console.error('Lỗi lưu bình luận:', error);
  }
};

const loadCommentsFromStorage = async (postId) => {
  try {
    const allComments = JSON.parse(await AsyncStorage.getItem('allComments')) || {};
    return allComments[postId] || [];
  } catch (error) {
    console.error('Lỗi tải bình luận:', error);
    return [];
  }
};

const Comment = ({ comment, onLike, onReply, onDelete }) => (
  <View style={styles.commentContainer}>
    <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
    <View style={styles.commentContent}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUsername}>{comment.username}</Text>
        <Text style={styles.commentText}>{comment.text}</Text>
      </View>
      <View style={styles.commentActions}>
        <Text style={styles.timestamp}>{comment.timestamp}</Text>
        <TouchableOpacity onPress={() => onLike(comment.id)}>
          <Text style={styles.actionText}>{comment.likes} like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onReply(comment.id)}>
          <Text style={styles.actionText}>Reply</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(comment.id)}>
          <Text style={styles.actionTextDelete}>Delete</Text>
        </TouchableOpacity>
      </View>
      {comment.replies && comment.replies.map((reply) => (
        <View key={reply.id} style={styles.replyContainer}>
          <Image source={{ uri: reply.userAvatar }} style={styles.replyAvatar} />
          <View style={styles.replyContent}>
            <View style={styles.replyHeader}>
              <Text style={styles.replyUsername}>{reply.username}</Text>
              {reply.replyTo && (
                <Text style={styles.replyToText}>@{reply.replyTo}</Text>
              )}
              <Text style={styles.replyText}>{reply.text}</Text>
            </View>
            <View style={styles.replyActions}>
              <Text style={styles.timestamp}>{reply.timestamp}</Text>
              <TouchableOpacity onPress={() => onLike(reply.id)}>
                <Text style={styles.actionText}>{reply.likes} like</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const CommentsModal = ({ visible, onClose, postId, comments: initialComments, onCommentAdded }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (visible) {
      const fetchComments = async () => {
        const storedComments = await loadCommentsFromStorage(postId);
        setComments(storedComments);
      };
      fetchComments();
    }
  }, [visible]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id: Date.now().toString(),
      username: 'Thanh Quyền',
      userAvatar: 'https://i.pravatar.cc/100',
      text: newComment,
      timestamp: 'now',
      likes: 0,
      replies: [],
    };

    const updatedComments = [...comments, newCommentObj];
    setComments(updatedComments);
    setNewComment('');
    await saveCommentsToStorage(postId, updatedComments);

    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    inputRef.current?.focus();
  };

  const handleLike = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, likes: comment.likes + 1 };
      }
      return comment;
    }));
  };

  const handleDeleteComment = async (commentId) => {
    const updatedComments = comments.filter((comment) => comment.id !== commentId);
    setComments(updatedComments);
    await saveCommentsToStorage(postId, updatedComments);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
        </View>

        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Comment
              comment={item}
              onLike={handleLike}
              onReply={handleReply}
              onDelete={handleDeleteComment}
            />
          )}
          style={styles.commentsList}
        />

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inputContainer}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.inputAvatar}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            onPress={handleAddComment}
            style={[
              styles.sendButton,
              !newComment.trim() && styles.sendButtonDisabled
            ]}
            disabled={!newComment.trim()}
          >
            <Ionicons 
              name="send" 
              size={24} 
              color={newComment.trim() ? "#0095f6" : "#999"} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  commentText: {
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 5,
  },
  actionText: {
    marginRight: 10,
    color: '#007AFF',
  },
  actionTextDelete: {
    color: 'red',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 10,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentsModal;

