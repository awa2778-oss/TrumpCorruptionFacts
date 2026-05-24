import React, { useMemo } from "react";
import {
  View, Text, ScrollView, RefreshControl, TouchableOpacity,
  StyleSheet, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useListActions,
  useGetActionStats,
  useListRetributionActions,
  getListRetributionActionsQueryKey,
  useListSupremeCourtCases,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS, calcAASI } from "@/constants/algorithms";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

const CHIP_TXT = { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" as const, letterSpacing: 0.5 };

function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_COLORS[status] ?? { bg: "#6B7280", label: status.toUpperCase() };
  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 5, paddingVertical: 2 }}>
      <Text style={CHIP_TXT}>{cfg.label}</Text>
    </View>
  );
}

function CatChip({ category }: { category: string }) {
  const bg = CATEGORY_COLORS[category] ?? "#6B7280";
  const label = CATEGORY_LABELS[category] ?? category.replace(/_/g, " ").toUpperCase();
  return (
    <View style={{ backgroundColor: bg, paddingHorizontal: 5, paddingVertical: 2 }}>
      <Text style={CHIP_TXT}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();

  const { data: actions, isLoading: l1, refetch: r1 } = useListActions({});
  const { data: stats } = useGetActionStats({});
  const { data: retActions } = useListRetributionActions(
    {},
    { query: { queryKey: getListRetributionActionsQueryKey({}) } }
  );
  const { data: scotus } = useListSupremeCourtCases({});

  const isLoading = l1;
  function handleRefresh() { r1(); }

  const recentActions = useMemo(() => (actions as any[] ?? []).slice(0, 6), [actions]);
  const totalBlocked  = useMemo(
    () => (stats?.byStatus ?? []).find((s: any) => s.status === "blocked")?.count ?? 0,
    [stats]
  );
  const avgAASI = useMemo(() => {
    const all = actions as any[] ?? [];
    if (!all.length) return 0;
    const total = all.reduce((s: number, a: any) => s + calcAASI({
      category: a.category, status: a.status,
      supremeCourtChallenged: a.supremeCourtChallenged,
      factualityRating: a.factualityRating, date: a.date,
    }), 0);
    return Math.round(total / all.length);
  }, [actions]);

  const S = makeStyles(colors);

  return (
    <ScrollView
      style={[S.scroll, { paddingTop: WEB_TOP }]}
      contentContainerStyle={S.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} tintColor={colors.destructive} />}
    >
      {/* Hero header */}
      <View style={S.hero}>
        <View style={S.heroInner}>
          <Text style={S.heroTitle}>ADMIN{"\n"}TRACKER</Text>
          <Text style={S.heroSub}>TRUMP 2025 · LIVE DATA</Text>
        </View>
        <View style={S.heroAccent} />
      </View>

      {/* Stats grid */}
      <View style={S.statsRow}>
        {[
          { label: "ACTIONS",     value: (actions as any[])?.length ?? 0,   color: colors.red },
          { label: "BLOCKED",     value: totalBlocked,                        color: colors.blue },
          { label: "SCOTUS",      value: (scotus as any[])?.length ?? 0,    color: colors.purple },
          { label: "RETRIBUTION", value: (retActions as any[])?.length ?? 0, color: colors.orange },
        ].map((s) => (
          <View key={s.label} style={[S.statBox, { borderColor: s.color }]}>
            <Text style={[S.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={[S.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Algorithm score */}
      <View style={[S.scoreBox, { borderColor: colors.red, backgroundColor: colors.red }]}>
        <Text style={[S.scoreLabel, { color: "#FFFFFF" }]}>AVG SEVERITY SCORE (AASI)</Text>
        <Text style={[S.scoreNum, { color: colors.yellow }]}>{avgAASI}</Text>
        <Text style={[S.scoreDesc, { color: "rgba(255,255,255,0.7)" }]}>/ 100 · across all {(actions as any[])?.length ?? 0} actions</Text>
      </View>

      {/* Recent actions */}
      <View style={S.section}>
        <View style={S.sectionHeader}>
          <Text style={[S.sectionTitle, { color: colors.foreground }]}>LATEST ACTIONS</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/actions")}>
            <Text style={[S.seeAll, { color: colors.destructive }]}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          [1,2,3,4].map(i => <View key={i} style={[S.skeleton, { backgroundColor: colors.muted }]} />)
        ) : (
          recentActions.map((a: any) => (
            <TouchableOpacity
              key={a.id}
              style={[S.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.75}
              onPress={() => router.push({ pathname: "/action/[id]", params: { id: String(a.id) } })}
            >
              <View style={S.cardRow}>
                <View style={S.cardChips}>
                  <CatChip category={a.category} />
                  <StatusChip status={a.status} />
                </View>
                <Text style={[S.cardDate, { color: colors.mutedForeground }]}>{a.date?.slice(0,10)}</Text>
              </View>
              <Text style={[S.cardTitle, { color: colors.foreground }]} numberOfLines={2}>{a.title}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Quick links */}
      <View style={S.section}>
        <Text style={[S.sectionTitle, { color: colors.foreground }]}>QUICK ACCESS</Text>
        <View style={S.quickGrid}>
          {[
            { label: "THE REVENGE TOUR",      icon: "crosshair",  route: "/(tabs)/revenge",   color: colors.purple },
            { label: "DATA ANALYTICS",         icon: "bar-chart-2", route: "/(tabs)/analytics", color: colors.blue },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              style={[S.quickBtn, { borderColor: q.color, backgroundColor: colors.card }]}
              activeOpacity={0.75}
              onPress={() => router.push(q.route as any)}
            >
              <Feather name={q.icon as any} size={20} color={q.color} />
              <Text style={[S.quickLabel, { color: q.color }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: colors.background },
  content:      { paddingBottom: 100 },
  hero:         { backgroundColor: colors.secondary, marginBottom: 0, position: "relative", overflow: "hidden" },
  heroInner:    { padding: 20, paddingTop: 24, paddingBottom: 16 },
  heroAccent:   { position: "absolute", right: -20, top: -20, width: 120, height: 120, backgroundColor: colors.primary, opacity: 0.15, transform: [{ rotate: "45deg" }] },
  heroTitle:    { fontSize: 48, fontFamily: "Inter_700Bold", color: colors.primary, lineHeight: 46, letterSpacing: 2 },
  heroSub:      { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "rgba(255,255,255,0.5)", letterSpacing: 3, marginTop: 6 },

  statsRow:     { flexDirection: "row", padding: 12, gap: 8 },
  statBox:      { flex: 1, borderWidth: 3, padding: 10, alignItems: "center" },
  statNum:      { fontSize: 26, fontFamily: "Inter_700Bold", lineHeight: 28 },
  statLabel:    { fontSize: 8, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginTop: 2 },

  scoreBox:     { marginHorizontal: 12, marginBottom: 4, padding: 16, borderWidth: 4, flexDirection: "row", alignItems: "center", gap: 12 },
  scoreLabel:   { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, flex: 1 },
  scoreNum:     { fontSize: 40, fontFamily: "Inter_700Bold", lineHeight: 42 },
  scoreDesc:    { fontSize: 10, fontFamily: "Inter_400Regular" },

  section:      { padding: 12, paddingTop: 16 },
  sectionHeader:{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottomWidth: 3, borderBottomColor: "#1A1A1A", paddingBottom: 6 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  seeAll:       { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },

  card:         { borderWidth: 3, padding: 12, marginBottom: 8 },
  cardRow:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  cardChips:    { flexDirection: "row", gap: 4 },
  cardDate:     { fontSize: 10, fontFamily: "Inter_400Regular" },
  cardTitle:    { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 18 },

  skeleton:     { height: 72, marginBottom: 8, opacity: 0.5 },

  quickGrid:    { flexDirection: "row", gap: 10, marginTop: 6 },
  quickBtn:     { flex: 1, borderWidth: 3, padding: 14, alignItems: "center", gap: 8 },
  quickLabel:   { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, textAlign: "center" },

  chipText:     { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
});
