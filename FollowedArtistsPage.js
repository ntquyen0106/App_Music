import React, { useState, useEffect } from 'react';
import {Image, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons'; // Icon thư viện FontAwesome
import { useAppContext } from './AppContext'; // Import AppContext

const FollowedArtistsPage = ({ navigation }) => {
  const { followedArtists, setFollowedArtists } = useAppContext(); // Lấy từ AppContext

  // Tải danh sách nghệ sĩ đã theo dõi từ AsyncStorage
  useEffect(() => {
    const loadFollowedArtists = async () => {
      try {
        const storedArtists = await AsyncStorage.getItem('follow');
        const parsedArtists = storedArtists ? JSON.parse(storedArtists) : [];
        setFollowedArtists(Array.isArray(parsedArtists) ? parsedArtists : []); // Đảm bảo là mảng
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
      }
    };

    loadFollowedArtists(); // Gọi hàm chỉ một lần khi component được mount
  }, [setFollowedArtists]);

  // Bỏ theo dõi nghệ sĩ
  const unfollowArtist = async (artistId) => {
    try {
      const updatedArtists = followedArtists.filter((artist) => artist.id !== artistId);
      setFollowedArtists(updatedArtists);
      await AsyncStorage.setItem('follow', JSON.stringify(updatedArtists));
    } catch (error) {
      console.error('Lỗi khi bỏ theo dõi nghệ sĩ:', error);
    }
  };
  useEffect(() => {
  const loadData = async () => {
    try {
      const storedFollowedArtists = await AsyncStorage.getItem('followedArtists');
      const storedFavorites = await AsyncStorage.getItem('favoriteSongs');
      
      if (storedFollowedArtists) {
        setFollowedArtists(JSON.parse(storedFollowedArtists));
      }
      if (storedFavorites) {
        setLibrary(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ AsyncStorage:', error);
    }
  };

  loadData();
}, []); // Chỉ gọi một lần khi component được render lần đầu


  // Hiển thị từng nghệ sĩ
  const renderArtistItem = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.artItem}>
        <View style={{
          flexDirection:'row',
        }}>
            <Image source={{uri: item.anh}} style={styles.artImg} />
            <View>
                <Text style={styles.nameartist}>{item.name}</Text>
                <View style={{
                  flexDirection:'row',
                }}>
                    <FontAwesome style={styles.icon} name="users" size={15} color="gray" />
                    <Text style={styles.fl}>{item.follow}</Text>
                </View>
            </View>
        </View>
        <View>
          <TouchableOpacity onPress={() => unfollowArtist(item.id)}>
              <Text style={styles.followButton}>Unfollow</Text>
          </TouchableOpacity>
        </View>
    </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nghệ sĩ đã theo dõi</Text>
      {followedArtists.length > 0 ? (
        <FlatList
          data={followedArtists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.emptyText}>Bạn chưa theo dõi nghệ sĩ nào.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  artItem: {
    padding:10,
    justifyContent:'space-between',
    flexDirection:'row',
    alignItems:'center',
    width: 320,
    height: 60 ,
    marginRight: 15,
  },
  artImg: {
    margin:5,
    borderRadius:20,
    width: 50,
    height:50,
  },
  nameartist:{
    marginTop:8,
    marginBottom:5,
    fontWeight:'bold',
  },
  followButton:{
    padding:7,
    borderWidth:1,
    borderRadius:20,
  },
  unfollowText: {
    color: 'red',  // Màu đỏ để nổi bật
    fontSize: 16,   // Cỡ chữ hợp lý
    fontWeight: 'bold',  // Tạo sự nổi bật cho chữ
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FollowedArtistsPage;
