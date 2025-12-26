/**
 * Google Autocomplete Component for React Native
 * Uses Google Places Autocomplete API via REST
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Search } from "lucide-react-native";
import Input from "./Input";
import { colors, spacing, borderRadius, shadows } from "../theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const GOOGLE_PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place";

const GoogleAutocomplete = ({
  placeholder = "Search for a location...",
  onPlaceSelect,
  apiKey,
  containerStyle,
  ...props
}) => {
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

  // Debounce API calls
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!inputValue.trim()) {
      setPredictions([]);
      setShowSuggestions(false);
      if (onPlaceSelect) onPlaceSelect(null);
      return;
    }

    if (!apiKey) {
      console.warn("Google Places API key is not provided");
      return;
    }

    setIsLoading(true);
    debounceTimer.current = setTimeout(() => {
      fetchPredictions(inputValue);
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, apiKey]);

  const fetchPredictions = async (query) => {
    try {
      const url = `${GOOGLE_PLACES_API_BASE}/autocomplete/json?input=${encodeURIComponent(
        query
      )}&key=${apiKey}&types=establishment|geocode`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.predictions) {
        setPredictions(data.predictions);
        setShowSuggestions(true);
      } else {
        setPredictions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    try {
      const url = `${GOOGLE_PLACES_API_BASE}/details/json?place_id=${placeId}&key=${apiKey}&fields=name,formatted_address,geometry,address_components,place_id,types`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.result) {
        if (onPlaceSelect) {
          onPlaceSelect(data.result);
        }
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handlePredictionSelect = (prediction) => {
    setInputValue(prediction.description);
    setShowSuggestions(false);
    setPredictions([]);
    fetchPlaceDetails(prediction.place_id);
  };

  const handleInputChange = (text) => {
    setInputValue(text);
  };

  const handleInputFocus = () => {
    if (predictions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for selection
    setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inputWrapper}>
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          icon={Search}
          containerStyle={styles.inputContainer}
          {...props}
        />
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </View>

      {showSuggestions && predictions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.suggestionItem,
                  index === predictions.length - 1 && styles.suggestionItemLast,
                ]}
                onPress={() => handlePredictionSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionMainText}>
                    {item.structured_formatting?.main_text || item.description}
                  </Text>
                  {item.structured_formatting?.secondary_text && (
                    <Text style={styles.suggestionSecondaryText}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
            contentContainerStyle={styles.suggestionsListContent}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  inputWrapper: {
    position: "relative",
  },
  inputContainer: {
    flex: 1,
  },
  loadingIndicator: {
    position: "absolute",
    right: spacing.md,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    borderWidth: 1,
    borderColor: colors.border,
    height: 450, // Fixed height to show at least 5-6 suggestions (each item ~55-60px)
    ...shadows.large,
    zIndex: 1000,
    elevation: 5,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionsListContent: {
    paddingVertical: spacing.xs,
    paddingBottom: spacing.sm, // Extra padding at bottom for better visibility
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    gap: spacing.xs / 2,
  },
  suggestionMainText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  suggestionSecondaryText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export default GoogleAutocomplete;
