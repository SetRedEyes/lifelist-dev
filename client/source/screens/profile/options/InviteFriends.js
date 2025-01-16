import React, { useState, useEffect, useRef } from "react";
import { FlatList, View, Text } from "react-native";
import * as Contacts from "expo-contacts";
import UserInviteCard from "../../../cards/user/UserInviteCard";
import SearchBar from "../../../headers/SearchBar";
import { layoutStyles } from "../../../styles/components/index";

export default function InviteFriends() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchBarRef = useRef(null);

  // Fetch contacts on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Contacts permission denied.");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        // Filter out contacts with no phone numbers
        const validContacts = data.filter((contact) => contact.phoneNumbers);
        setContacts(validContacts);
      }
    })();
  }, []);

  // Filter contacts based on search query
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phoneNumbers?.some((pn) =>
        pn.number.replace(/\D/g, "").includes(searchQuery.replace(/\D/g, ""))
      )
  );

  // Render each invite card
  const renderInviteFriendItem = ({ item }) => (
    <UserInviteCard contact={item} />
  );

  // Handle search
  const handleSearch = () => {
    console.log("Search initiated for:", searchQuery);
  };

  // Handle focus change
  const handleFocusChange = (isFocused) => {
    console.log("SearchBar is focused:", isFocused);
  };

  return (
    <View
      style={[layoutStyles.wrapper, { paddingTop: 16, paddingHorizontal: 8 }]}
    >
      {/* Search Bar */}
      <View style={{ paddingBottom: 8 }}>
        <SearchBar
          ref={searchBarRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          onFocusChange={handleFocusChange}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderInviteFriendItem}
        keyExtractor={(item) => item.id || item.recordID}
        style={layoutStyles.listContainer}
      />

      {/* No Contacts Found */}
      {filteredContacts.length === 0 && (
        <View style={layoutStyles.noResultsContainer}>
          <Text style={layoutStyles.noResultsText}>No contacts found.</Text>
        </View>
      )}
    </View>
  );
}
