import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CommentsModal from './CommentsModal';

const FeedPost = ({ item, onCommentsPress }) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.avatar || 'https://i.pravatar.cc/100' }}
            style={styles.avatar}
          />
          <View style={styles.postMeta}>
            <View style={styles.nameContainer}>
              <Text style={styles.username}>{item.caSi}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" />
            </View>
            <Text style={styles.postInfo}>Posted a track • {item.timeAgo || '1d'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={{ uri: item.anh || 'https://via.placeholder.com/400' }}
          style={styles.postImage}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{item.tenAlbum || item.tenBaiHat}</Text>
          <Text style={styles.artistName}>{item.caSi}</Text>
        </View>
        <View style={styles.duration}>
          <Text style={styles.playCount}>{`▶ ${item.luotNghe || '0'}  •  `}</Text>
          <Text style={styles.durationText}>{item.thoiGian || '0:00'}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setLiked(!liked)}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? '#FF3B30' : '#666'}
          />
          <Text style={styles.actionText}>{item.likes || '0'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onCommentsPress}>
          <Ionicons name="chatbubble-outline" size={22} color="#666" />
          <Text style={styles.actionText}>
            {item.commentCount || 0} Bình luận
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="arrow-redo-outline" size={24} color="#666" />
          <Text style={styles.actionText}>{item.shares || '0'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FeedScreen = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState({}); // Lưu bình luận theo postId
  const [data, setData] = useState([]); // Dữ liệu bài hát từ MockAPI
  const [loading, setLoading] = useState(true); // Trạng thái tải dữ liệu

  // Tải comments từ AsyncStorage
  useEffect(() => {
    const loadComments = async () => {
      try {
        const storedComments = await AsyncStorage.getItem('comments');
        setComments(storedComments ? JSON.parse(storedComments) : {});
      } catch (error) {
        console.error('Lỗi tải bình luận:', error);
      }
    };
    loadComments();
  }, []);

  // Lưu comments vào AsyncStorage
  const saveComments = async (updatedComments) => {
    try {
      await AsyncStorage.setItem('comments', JSON.stringify(updatedComments));
    } catch (error) {
      console.error('Lỗi lưu bình luận:', error);
    }
  };

  // Cập nhật số lượng bình luận trong danh sách bài viết
  const updatePostCommentCount = (postId) => {
    setData((prevData) =>
      prevData.map((post) =>
        post.id === postId
          ? { ...post, commentCount: (post.commentCount || 0) + 1 }
          : post
      )
    );
  };

  // Xử lý thêm bình luận
  const handleAddComment = (postId, newComment) => {
    const updatedComments = {
      ...comments,
      [postId]: [
        ...(comments[postId] || []),
        {
          id: `${Date.now()}`, // ID duy nhất
          username: 'User',
          userAvatar: 'https://i.pravatar.cc/150?img=10',
          text: newComment,
          timestamp: 'Vừa xong',
        },
      ],
    };

    setComments(updatedComments);
    saveComments(updatedComments);
    updatePostCommentCount(postId); // Cập nhật số lượng bình luận
  };

  // Lấy dữ liệu từ MockAPI
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://671a3dbbacf9aa94f6a9ccd8.mockapi.io/song');
        const result = await response.json();

        const allSongs = result[0]?.songs.map((song) => ({
          ...song,
          commentCount: song.commentCount || 0, // Khởi tạo trường commentCount từ MockAPI
        })) || [];
        setData(allSongs);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi tải dữ liệu từ MockAPI:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <FeedPost
              item={item}
              onCommentsPress={() => {
                setSelectedPost(item);
                setShowComments(true);
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedPost && (
        <CommentsModal
          visible={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedPost(null);
          }}
          postId={selectedPost.id}
          comments={comments[selectedPost.id] || []}
          onAddComment={(newComment) =>
            handleAddComment(selectedPost.id, newComment)
          }
          onCommentAdded={() => updatePostCommentCount(selectedPost.id)} // Callback cập nhật commentCount
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
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexDirection: 'column',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontWeight: 'bold',
  },
  postInfo: {
    color: '#666',
    fontSize: 12,
  },
  moreButton: {
    padding: 5,
  },
  contentContainer: {
    marginVertical: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  songInfo: {
    marginVertical: 5,
  },
  songTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  artistName: {
    color: '#666',
    fontSize: 14,
  },
  duration: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  playCount: {
    fontSize: 12,
    color: '#666',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    marginLeft: 5,
    color: '#666',
  },
});

export default FeedScreen;
