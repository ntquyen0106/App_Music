// FeedScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CommentsModal from './CommentsModal';

// Mock data for testing
const MOCK_DATA = {
  trends: [
    {
      id: '1',
      caSi: 'Jessica Gonzalez',
      timeAgo: '3d',
      anh: 'https://picsum.photos/400/400',
      tenAlbum: 'Summer Vibes',
      likes: '1.2K',
      shares: 45,
      duration: '3:45'
    },
    {
      id: '2',
      caSi: 'Mike Wilson',
      timeAgo: '5d',
      anh: 'https://picsum.photos/400/401',
      tenAlbum: 'Night Drive',
      likes: '856',
      shares: 32,
      duration: '4:12'
    }
  ]
};

const MOCK_COMMENTS = [
  {
    id: '1',
    username: 'Sally Rooney',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    text: 'Do duis culpa 🎵',
    timestamp: '1h',
    likes: 1,
    replies: []
  },
  {
    id: '2',
    username: 'Jason',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    text: 'Minim magna exc 🎵',
    timestamp: '2h',
    likes: 1,
    replies: [
      {
        id: '3',
        username: 'Michael Key',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        text: 'Deserunt officia consectetur adipi',
        timestamp: '40m',
        likes: 2,
        replyTo: 'Jason'
      }
    ]
  }
];

const FeedPost = ({ item, onCommentsPress }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
          <View style={styles.postMeta}>
            <View style={styles.nameContainer}>
              <Text style={styles.username}>{item.caSi}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
            </View>
            <Text style={styles.postInfo}>Posted a track • {item.timeAgo}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={{ uri: item.anh }}
          style={styles.postImage}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{item.tenAlbum}</Text>
          <Text style={styles.artistName}>{item.caSi}</Text>
        </View>
        <View style={styles.duration}>
          <Text style={styles.playCount}>{`▶ ${item.likes}  •  `}</Text>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={24} 
            color={liked ? "#FF3B30" : "#666"}
          />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onCommentsPress}
        >
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>{MOCK_COMMENTS.length}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="arrow-redo-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedScreen = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={MOCK_DATA.trends}
        renderItem={({ item }) => (
          <FeedPost 
            item={item} 
            onCommentsPress={() => {
              setSelectedPost(item);
              setShowComments(true);
            }}
          />
        )}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
      />
      
      {selectedPost && (
        <CommentsModal
          visible={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedPost(null);
          }}
          postId={selectedPost.id}
          comments={MOCK_COMMENTS}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 15,
    marginBottom: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postMeta: {
    justifyContent: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postInfo: {
    color: '#666',
    fontSize: 14,
  },
  moreButton: {
    padding: 5,
  },
  contentContainer: {
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#f0f0f0',
  },
  songInfo: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  songTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  artistName: {
    color: '#fff',
    fontSize: 16,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  playCount: {
    color: '#666',
    fontSize: 14,
  },
  durationText: {
    color: '#666',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingTop: 10,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#666',
    fontSize: 14,
  },
});

export default FeedScreen;