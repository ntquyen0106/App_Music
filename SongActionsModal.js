import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // Thêm các icon
import AddToPlaylistModal from './AddToPlaylistModal'; // import modal bạn vừa tạo

const SongActionsModal = ({ visible, onClose, onAddToFavorites, onAddToPlaylist, song }) => {

    const openPlaylistModal = (song) => {
    setSelectedSong(song);
    setModalVisible(true);
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => toggleFavorite(item)}>
              <FontAwesome
                name="heart"
                size={24}
                color={library.some((s) => s.id === item.id) ? 'red' : 'gray'} // Kiểm tra trạng thái yêu thích
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => openPlaylistModal(item)}>
              <MaterialIcons name="playlist-add" size={24} color="gray" />
            </TouchableOpacity>
            {/* Modal hiển thị danh sách playlist */}
            <AddToPlaylistModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              selectedSong={selectedSong}
            />
          <TouchableOpacity
            style={[styles.modalButton, styles.modalCloseButton]}
            onPress={onClose} // Đóng modal
          >
            <Text style={styles.modalButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 5,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    width: '100%',
    alignItems: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#d9534f',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#333',
  },
});

export default SongActionsModal;
