import React, { useMemo, useState } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Platform, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useListActions } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS, calcAASI } from "@/constants/algorithms";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

const CATEGORIES = [
  { key: "", label: "ALL" },
  { key: "executive_order", label: "E.O." },
  { key: "immigration",     label: "IMMIG" },
  { key: "tariff",          label: "TARIFF" },
  { key: "deregulation",    label: "DEREG" },
  { key: "foreign_policy",  label: "F.P." },
  { key: "policy",          label: "POLICY" },
  { key: "proclamation",    label: "PROC" },
];

const STATUSES = [
  { key: "", label: "ALL" },
  { key: "enacted",  label: "ENACTED" },
  { key: "blocked",  label: "BLOCKED" },
  { key: "pending",  label: "PENDING" },
  { key: "reversed", label: "REVERSED" },
];

export default function ActionsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [search, setSearch]     = useState("");
  const [catFilter, setCat]     = useState("");
  const [statFilter, setStat]   = useState("");

  const { data: actions, isLoading, refetch } = useListActions({});

  const filtered = useMemo(() => {
    let list = (actions as any[] ?? []);
    if (catFilter)  list = list.filter((a: any) => a.category === catFilter);
    if (statFilter) list = list.filter((a: any) => a.status  === statFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a: any) =>
        a.title?.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [actions, catFilter, statFilter, search]);

  const S = makeStyles(colors);

  function renderItem({ item: a }: { item: any }) {
    const score = calcAASI({
      category: a.category, status: a.status,
      supremeCourtChallenged: a.supremeCourtChallenged,
      factualityRating: a.factualityRating, date: a.date,
    });
    const catColor = CATEGORY_COLORS[a.category] ?? "#6B7280";
    const statCfg  = STATUS_COLORS[a.status] ?? { bg: "#6B7280", label: a.status?.toUpperCase() };
    const catLabel = CATEGORY_LABELS[a.category] ?? a.category?.replace(/_/g, " ").toUpperCase() ?? "";
    return (
      <TouchableOpacity
        style={[S.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.75}
        onPress={() => router.push({ pathname: "/action/[id]", params: { id: String(a.id) } })}
      >
        <View style={S.cardTop}>
          <View style={S.chips}>
            <View style={[S.chip, { backgroundColor: catColor }]}>
              <Text style={S.chipTxt}>{catLabel}</Text>
            </View>
            <View style={[S.chip, { backgroundColor: statCfg.bg }]}>
              <Text style={S.chipTxt}>{statCfg.label}</Text>
            </View>
            {a.supremeCourtChallenged && (
              <View style={[S.chip, { backgroundColor: colors.purple }]}>
                <Text style={S.chipTxt}>SCOTUS</Text>
              </View>
            )}
          </View>
          <View style={[S.scoreTag, { borderColor: score >= 70 ? colors.red : colors.border }]}>
            <Text style={[S.scoreTxt, { color: score >= 70 ? colors.red : colors.mutedForeground }]}>{score}</Text>
          </View>
        </View>
        <Text style={[S.title, { color: colors.foreground }]} numberOfLines={2}>{a.title}</Text>
        <Text style={[S.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{a.description}</Text>
        <View style={S.footer}>
          <Text style={[S.date, { color: colors.mutedForeground }]}>{a.date}</Text>
          <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[S.root, { paddingTop: WEB_TOP }]}>
      {/* Search bar */}
      <View style={[S.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[S.searchInput, { color: colors.foreground }]}
          placeholder="Search actions…"
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterRow} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.key}
            style={[S.filterChip, {
              backgroundColor: catFilter === c.key ? colors.secondary : colors.card,
              borderColor:     catFilter === c.key ? colors.secondary : colors.border,
            }]}
            onPress={() => setCat(catFilter === c.key ? "" : c.key)}
          >
            <Text style={[S.filterTxt, { color: catFilter === c.key ? colors.secondaryForeground : colors.foreground }]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 6 }}>
        {STATUSES.map((s) => {
          const active = statFilter === s.key;
          const sc = STATUS_COLORS[s.key];
          return (
            <TouchableOpacity
              key={s.key}
              style={[S.filterChip, {
                backgroundColor: active ? (sc?.bg ?? colors.secondary) : colors.card,
                borderColor:     active ? (sc?.bg ?? colors.secondary) : colors.border,
              }]}
              onPress={() => setStat(statFilter === s.key ? "" : s.key)}
            >
              <Text style={[S.filterTxt, { color: active ? "#FFFFFF" : colors.foreground }]}>{s.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results count */}
      <View style={[S.countBar, { borderColor: colors.border }]}>
        <Text style={[S.countTxt, { color: colors.mutedForeground }]}>{filtered.length} ACTIONS</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.destructive} size="large" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={S.empty}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[S.emptyTxt, { color: colors.mutedForeground }]}>No actions match your filters</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: colors.background },
  searchWrap:  { flexDirection: "row", alignItems: "center", margin: 12, borderWidth: 3, paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow:   { flexShrink: 0 },
  filterChip:  { paddingHorizontal: 10, paddingVertical: 5, borderWidth: 2 },
  filterTxt:   { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  countBar:    { borderBottomWidth: 2, paddingHorizontal: 12, paddingVertical: 6 },
  countTxt:    { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1 },

  card:        { borderWidth: 3, padding: 12, marginBottom: 8 },
  cardTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  chips:       { flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 },
  chip:        { paddingHorizontal: 5, paddingVertical: 2 },
  chipTxt:     { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  scoreTag:    { borderWidth: 2, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  scoreTxt:    { fontSize: 12, fontFamily: "Inter_700Bold" },
  title:       { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 18, marginBottom: 4 },
  desc:        { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16, marginBottom: 6 },
  footer:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date:        { fontSize: 10, fontFamily: "Inter_400Regular" },
  empty:       { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxt:    { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
