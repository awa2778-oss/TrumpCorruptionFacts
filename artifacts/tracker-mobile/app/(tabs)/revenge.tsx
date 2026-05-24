import React, { useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useListRetributionActions,
  useGetRetributionStats,
  getListRetributionActionsQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { OUTCOME_COLORS, CONN_WEIGHTS, calcRIS } from "@/constants/algorithms";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

const CONN_LABELS: Record<string, string> = {
  investigator:       "INVESTIGATOR",
  legal_adversary:    "LEGAL ADV.",
  appointed:          "APPOINTED",
  political_opponent: "POLITICAL OPP.",
  critic:             "CRITIC",
  institutional:      "INSTITUTIONAL",
};

function OutcomeChip({ outcome }: { outcome: string }) {
  const bg = OUTCOME_COLORS[outcome] ?? "#6B7280";
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 5, paddingVertical: 2 }}>
      <Text style={{ color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" as const, letterSpacing: 0.5 }}>
        {outcome.toUpperCase()}
      </Text>
    </View>
  );
}

export default function RevengeScreen() {
  const colors = useColors();
  const { data: retActions, isLoading, refetch } = useListRetributionActions(
    {},
    { query: { queryKey: getListRetributionActionsQueryKey({}) } }
  );
  const { data: retStats } = useGetRetributionStats({});

  const sorted = useMemo(() => {
    const list = retActions as any[] ?? [];
    return [...list].sort((a, b) => calcRIS(b) - calcRIS(a));
  }, [retActions]);

  const S = makeStyles(colors);

  function renderItem({ item: r }: { item: any }) {
    const score = calcRIS(r);
    const connLabel = CONN_LABELS[r.connectionType ?? ""] ?? (r.connectionType ?? "UNKNOWN").toUpperCase();
    return (
      <View style={[S.card, { backgroundColor: colors.card, borderColor: "#7C3AED" }]}>
        <View style={S.cardHeader}>
          <View style={S.headerLeft}>
            <OutcomeChip outcome={r.outcome} />
            {r.connectionType && (
              <View style={[S.connChip, { borderColor: "#7C3AED" }]}>
                <Text style={[S.connTxt, { color: "#7C3AED" }]}>{connLabel}</Text>
              </View>
            )}
          </View>
          <View style={[S.scoreTag, { borderColor: score >= 70 ? colors.red : "#7C3AED" }]}>
            <Text style={[S.scoreTxt, { color: score >= 70 ? colors.red : "#7C3AED" }]}>{score}</Text>
          </View>
        </View>

        <Text style={[S.title, { color: colors.foreground }]} numberOfLines={2}>{r.title}</Text>
        <View style={S.targetRow}>
          <Feather name="target" size={12} color="#7C3AED" />
          <Text style={[S.target, { color: "#7C3AED" }]} numberOfLines={1}>{r.target}</Text>
        </View>
        <Text style={[S.desc, { color: colors.mutedForeground }]} numberOfLines={2}>{r.description}</Text>
        <View style={S.footer}>
          <Text style={[S.date, { color: colors.mutedForeground }]}>{r.date}</Text>
          {r.judicialResponse && (
            <View style={[S.courtTag, { borderColor: colors.blue }]}>
              <Feather name="shield" size={9} color={colors.blue} />
              <Text style={[S.courtTxt, { color: colors.blue }]}>COURT RESPONSE</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[S.root, { paddingTop: WEB_TOP }]}>
      {/* Header */}
      <View style={[S.hero, { backgroundColor: "#7C3AED" }]}>
        <Text style={[S.heroTitle, { color: "#FFFFFF" }]}>THE REVENGE TOUR</Text>
        <Text style={[S.heroSub, { color: "rgba(255,255,255,0.6)" }]}>TARGETED RETRIBUTION ACTIONS</Text>
      </View>

      {/* Stats */}
      {retStats && (
        <View style={S.statsRow}>
          {[
            { label: "TOTAL",    value: (retStats as any).total,           color: "#7C3AED" },
            { label: "BLOCKED",  value: (retStats as any).blocked,         color: colors.blue },
            { label: "REVERSED", value: (retStats as any).judiciallyReversed, color: colors.green },
          ].map((s) => (
            <View key={s.label} style={[S.statBox, { borderColor: s.color }]}>
              <Text style={[S.statNum, { color: s.color }]}>{s.value ?? 0}</Text>
              <Text style={[S.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Disclaimer */}
      <View style={[S.disclaimer, { borderColor: "#7C3AED", backgroundColor: "#7C3AED11" }]}>
        <Feather name="alert-triangle" size={12} color="#7C3AED" />
        <Text style={[S.disclaimerTxt, { color: "#7C3AED" }]}>
          Sorted by Retribution Intensity Score (RIS). Actions raising constitutional concerns highlighted.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#7C3AED" size="large" />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item: any) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          scrollEnabled={!!sorted.length}
          ListEmptyComponent={
            <View style={S.empty}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={[S.emptyTxt, { color: colors.mutedForeground }]}>No retribution actions found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root:      { flex: 1, backgroundColor: colors.background },
  hero:      { padding: 16, paddingBottom: 12 },
  heroTitle: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  heroSub:   { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 2, marginTop: 2 },

  statsRow:  { flexDirection: "row", padding: 12, gap: 8 },
  statBox:   { flex: 1, borderWidth: 3, padding: 10, alignItems: "center" },
  statNum:   { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 2 },

  disclaimer:   { flexDirection: "row", alignItems: "flex-start", gap: 8, marginHorizontal: 12, marginBottom: 4, padding: 10, borderWidth: 2 },
  disclaimerTxt:{ fontSize: 11, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 15 },

  card:         { borderWidth: 3, padding: 12, marginBottom: 10 },
  cardHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  headerLeft:   { flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 },
  connChip:     { borderWidth: 1.5, paddingHorizontal: 5, paddingVertical: 2 },
  connTxt:      { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  scoreTag:     { borderWidth: 2, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 6 },
  scoreTxt:     { fontSize: 12, fontFamily: "Inter_700Bold" },
  title:        { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 18, marginBottom: 4 },
  targetRow:    { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  target:       { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
  desc:         { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16, marginBottom: 6 },
  footer:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  date:         { fontSize: 10, fontFamily: "Inter_400Regular" },
  courtTag:     { flexDirection: "row", alignItems: "center", gap: 3, borderWidth: 1.5, paddingHorizontal: 5, paddingVertical: 2 },
  courtTxt:     { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  empty:        { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTxt:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
