
import React, { useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

const Comment = ({ comment, onLike, onReply }) => (
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

const CommentsModal = ({ visible, onClose, postId, comments: initialComments }) => {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const inputRef = useRef(null);

  const handleAddComment = () => {
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

    if (replyTo) {
      setComments(comments.map(comment => {
        if (comment.id === replyTo) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newCommentObj]
          };
        }
        return comment;
      }));
      setReplyTo(null);
    } else {
      setComments([...comments, newCommentObj]);
    }

    setNewComment('');
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
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
            />
          )}
          style={styles.commentsList}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  commentUsername: {
    fontWeight: '600',
    marginRight: 8,
  },
  commentText: {
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  replyContainer: {
    flexDirection: 'row',
    marginTop: 12,
    marginLeft: 20,
  },
  replyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  replyUsername: {
    fontWeight: '600',
    marginRight: 4,
  },
  replyToText: {
    color: '#0095f6',
    marginRight: 4,
  },
  replyText: {
    flex: 1,
  },
  replyActions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 12,
    padding: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CommentsModal;