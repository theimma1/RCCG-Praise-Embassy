import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { membersApi } from "@/api/members";
import MemberCard from "@/components/MemberCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { MemberListItem } from "@/types/member";
import type { MainTabScreenProps } from "@/types/navigation";

type Props = MainTabScreenProps<"Members">;

const STATUS_FILTERS = ["All", "Active", "Inactive", "Visitor"];

export default function MemberDirectoryScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(text);
      setPage(1);
    }, 400);
  }, []);

  const statusParam = activeStatus === "All" ? undefined : activeStatus.toLowerCase();

  const { data, isLoading, isRefetching, refetch, isFetchingNextPage } = useQuery({
    queryKey: ["members", debouncedQuery, statusParam, page],
    queryFn: () =>
      membersApi.list({
        q: debouncedQuery || undefined,
        status: statusParam,
        page,
        page_size: 20,
      }),
    placeholderData: (prev) => prev,
  });

  const members = data?.items ?? [];
  const totalPages = data?.total_pages ?? 1;

  const loadMore = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="flex-1 items-center justify-center pt-20">
        <Ionicons name="people-outline" size={48} color="#cbd5e1" />
        <Text className="text-slate-400 text-base mt-3">No members found</Text>
        {debouncedQuery ? (
          <Text className="text-slate-400 text-sm mt-1">Try a different search term</Text>
        ) : null}
      </View>
    );
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator color="#1a237e" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      {/* Search bar */}
      <View className="bg-primary-800 px-4 pb-4 pt-2">
        <View className="flex-row items-center bg-white/10 rounded-xl px-3 py-2.5">
          <Ionicons name="search" size={18} color="#93c5fd" />
          <TextInput
            className="flex-1 ml-2 text-white text-base"
            placeholder="Search by name, email, phone..."
            placeholderTextColor="#93c5fd"
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#93c5fd" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status filters */}
      <View className="bg-white border-b border-slate-100">
        <FlatList
          horizontal
          data={STATUS_FILTERS}
          keyExtractor={(i) => i}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              className={`px-4 py-1.5 rounded-full mr-2 ${activeStatus === item ? "bg-primary-800" : "bg-slate-100"}`}
              onPress={() => { setActiveStatus(item); setPage(1); }}
              activeOpacity={0.7}
            >
              <Text className={`text-sm font-medium ${activeStatus === item ? "text-white" : "text-slate-600"}`}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      {data && (
        <View className="px-4 py-2 bg-slate-50">
          <Text className="text-slate-500 text-xs">
            {data.total} member{data.total !== 1 ? "s" : ""} found
          </Text>
        </View>
      )}

      {isLoading && !data ? (
        <LoadingSpinner message="Loading members..." />
      ) : (
        <FlatList<MemberListItem>
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          renderItem={({ item }) => (
            <MemberCard member={item} onPress={() => {}} />
          )}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => { setPage(1); refetch(); }}
              tintColor="#1a237e"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
