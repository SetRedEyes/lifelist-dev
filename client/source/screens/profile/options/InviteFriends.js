import React, { useState, useEffect, useRef } from "react";
import { FlatList, View, Text } from "react-native";
import * as Contacts from "expo-contacts";
import UserInviteCard from "../../../cards/user/UserInviteCard";
import SearchBar from "../../../headers/SearchBar";
import { layoutStyles } from "../../../styles/components/index";

export default function InviteFriends() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const searchBarRef = useRef(null);

  const handleFocusChange = (isFocused) => {
    console.log("Search bar focused:", isFocused);
  };

  // Fetch contacts on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        console.warn("Contacts permission denied.");
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.ImageAvailable,
          Contacts.Fields.Image,
        ],
      });

      if (data.length > 0) {
        // Filter contacts with at least one valid phone number
        const validContacts = data.filter(
          (contact) => contact.phoneNumbers && contact.phoneNumbers.length > 0
        );

        // Sort by name
        const sortedContacts = validContacts.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        setContacts(sortedContacts);
        setFilteredContacts(sortedContacts); // Initialize filtered list
      }
    })();
  }, []);

  // Filter contacts based on search query with debouncing
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      const normalizedQuery = searchQuery.trim().toLowerCase();

      // Filter contacts by first name, last name, or phone number
      const filtered = contacts.filter((contact) => {
        const firstNameMatch = contact.firstName
          ?.toLowerCase()
          .includes(normalizedQuery);
        const lastNameMatch = contact.lastName
          ?.toLowerCase()
          .includes(normalizedQuery);
        const phoneMatch = contact.phoneNumbers?.some((pn) =>
          pn.number
            .replace(/\D/g, "")
            .includes(normalizedQuery.replace(/\D/g, ""))
        );

        return firstNameMatch || lastNameMatch || phoneMatch;
      });

      setFilteredContacts(filtered);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, contacts]);

  // Render each invite card
  const renderInviteFriendItem = ({ item }) => (
    <UserInviteCard contact={item} />
  );

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
          onFocusChange={handleFocusChange}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        renderItem={renderInviteFriendItem}
        keyExtractor={(item) => item.id} // Ensure 'id' exists and is unique
        style={layoutStyles.listContainer}
        keyboardShouldPersistTaps="handled"
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
