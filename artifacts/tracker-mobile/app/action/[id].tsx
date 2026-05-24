import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useGetAction } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { STATUS_COLORS, CATEGORY_LABELS, CATEGORY_COLORS, calcAASI } from "@/constants/algorithms";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router  = useRouter();
  const colors  = useColors();
  const { data: action, isLoading, error } = useGetAction(Number(id));

  const S = makeStyles(colors);

  if (isLoading) {
    return (
      <View style={[S.center, { paddingTop: WEB_TOP }]}>
        <ActivityIndicator color={colors.destructive} size="large" />
      </View>
    );
  }

  if (error || !action) {
    return (
      <View style={[S.center, { paddingTop: WEB_TOP }]}>
        <Feather name="alert-triangle" size={32} color={colors.destructive} />
        <Text style={[S.errorTxt, { color: colors.destructive }]}>Action not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[S.backLink, { color: colors.mutedForeground }]}>← Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const a = action as any;
  const catColor = CATEGORY_COLORS[a.category] ?? "#6B7280";
  const catLabel = CATEGORY_LABELS[a.category] ?? a.category?.replace(/_/g, " ").toUpperCase() ?? "";
  const statCfg  = STATUS_COLORS[a.status] ?? { bg: "#6B7280", label: (a.status ?? "").toUpperCase() };
  const score    = calcAASI({
    category: a.category, status: a.status,
    supremeCourtChallenged: a.supremeCourtChallenged,
    factualityRating: a.factualityRating, date: a.date,
  });

  const refs = (a.references ?? []) as Array<{ title: string; url: string; source: string }>;

  return (
    <ScrollView style={[S.scroll, { paddingTop: WEB_TOP }]} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Back */}
      <TouchableOpacity style={S.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={16} color={colors.foreground} />
        <Text style={[S.backTxt, { color: colors.foreground }]}>ALL ACTIONS</Text>
      </TouchableOpacity>

      {/* Chips + score header */}
      <View style={[S.header, { backgroundColor: colors.secondary }]}>
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
        <View style={S.scoreWrap}>
          <Text style={S.scoreLabel}>AASI</Text>
          <Text style={[S.scoreNum, { color: score >= 70 ? colors.yellow : "#FFFFFF" }]}>{score}</Text>
          <Text style={S.scoreSub}>/100</Text>
        </View>
      </View>

      {/* Title */}
      <View style={S.section}>
        <Text style={[S.title, { color: colors.foreground }]}>{a.title}</Text>
        <Text style={[S.date, { color: colors.mutedForeground }]}>{a.date} · {(a.administration ?? "").replace(/_/g, " ").toUpperCase()}</Text>
      </View>

      {/* Description */}
      <View style={[S.block, { borderColor: colors.border }]}>
        <Text style={[S.blockLabel, { color: colors.mutedForeground }]}>DESCRIPTION</Text>
        <Text style={[S.blockBody, { color: colors.foreground }]}>{a.description}</Text>
      </View>

      {/* Significance */}
      {a.significance && (
        <View style={[S.block, { borderColor: colors.red, backgroundColor: "#CC000008" }]}>
          <Text style={[S.blockLabel, { color: colors.red }]}>SIGNIFICANCE</Text>
          <Text style={[S.blockBody, { color: colors.foreground }]}>{a.significance}</Text>
        </View>
      )}

      {/* Factuality */}
      {a.factualityRating && (
        <View style={[S.block, { borderColor: colors.border }]}>
          <Text style={[S.blockLabel, { color: colors.mutedForeground }]}>FACTUALITY RATING</Text>
          <View style={[S.factRow]}>
            <View style={[S.chip, { backgroundColor: a.factualityRating === "high" ? colors.green : a.factualityRating === "mixed" ? colors.amber : colors.red }]}>
              <Text style={S.chipTxt}>{(a.factualityRating ?? "").toUpperCase()}</Text>
            </View>
            {a.factualitySource && <Text style={[S.factSource, { color: colors.mutedForeground }]}>Source: {a.factualitySource}</Text>}
          </View>
          {a.factualityNotes && (
            <Text style={[S.blockBody, { color: colors.mutedForeground, marginTop: 6 }]}>{a.factualityNotes}</Text>
          )}
        </View>
      )}

      {/* Algorithm explanation */}
      <View style={[S.algoBlock, { borderColor: colors.border, backgroundColor: colors.muted }]}>
        <Text style={[S.blockLabel, { color: colors.mutedForeground }]}>HOW THE AASI SCORE IS CALCULATED</Text>
        <Text style={[S.algoFormula, { color: colors.red }]}>
          AASI = (cat_weight × 30) + (status_mult × 30) + (court_bonus × 20) + (factuality × 10) + (recency × 10)
        </Text>
        <View style={S.algoRows}>
          {[
            [`Category weight (${a.category})`, `${Math.round(({"immigration":1.0,"executive_order":0.9,"foreign_policy":0.88,"tariff":0.8,"deregulation":0.72,"policy":0.6,"proclamation":0.4}[a.category as string] ?? 0.5) * 30)} pts`],
            [`Status (${a.status})`,            `${Math.round(({"enacted":1.0,"pending":0.7,"blocked":0.35,"reversed":0.1}[a.status as string] ?? 0.5) * 30)} pts`],
            ["SCOTUS challenged",               a.supremeCourtChallenged ? "20 pts" : "0 pts"],
            ["Total score",                     `${score} / 100`],
          ].map(([k, v]) => (
            <View key={k} style={S.algoRow}>
              <Text style={[S.algoKey, { color: colors.foreground }]}>{k}</Text>
              <Text style={[S.algoVal, { color: colors.foreground }]}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* References */}
      {refs.length > 0 && (
        <View style={S.section}>
          <Text style={[S.blockLabel, { color: colors.mutedForeground }]}>REFERENCES ({refs.length})</Text>
          {refs.map((ref, i) => (
            <TouchableOpacity
              key={i}
              style={[S.refRow, { borderColor: colors.border }]}
              onPress={() => ref.url && Linking.openURL(ref.url)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[S.refTitle, { color: colors.foreground }]} numberOfLines={1}>{ref.title}</Text>
                <Text style={[S.refSource, { color: colors.mutedForeground }]}>{ref.source}</Text>
              </View>
              <Feather name="external-link" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  scroll:       { flex: 1, backgroundColor: colors.background },
  center:       { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, backgroundColor: colors.background },
  errorTxt:     { fontSize: 16, fontFamily: "Inter_700Bold" },
  backLink:     { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  backBtn:      { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, paddingBottom: 0 },
  backTxt:      { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },

  header:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  chips:        { flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 },
  chip:         { paddingHorizontal: 6, paddingVertical: 3 },
  chipTxt:      { color: "#FFFFFF", fontSize: 9, fontFamily: "Inter_700Bold" as const, letterSpacing: 0.5 },
  scoreWrap:    { alignItems: "center", marginLeft: 12 },
  scoreLabel:   { fontSize: 9,  fontFamily: "Inter_700Bold" as const, color: "rgba(255,255,255,0.5)", letterSpacing: 1 },
  scoreNum:     { fontSize: 40, fontFamily: "Inter_700Bold" as const, lineHeight: 40 },
  scoreSub:     { fontSize: 9,  fontFamily: "Inter_400Regular" as const, color: "rgba(255,255,255,0.5)" },

  section:      { padding: 16, paddingBottom: 0 },
  title:        { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 24, marginBottom: 4 },
  date:         { fontSize: 11, fontFamily: "Inter_400Regular" },

  block:        { borderWidth: 3, margin: 12, marginBottom: 0, padding: 12 },
  blockLabel:   { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 1.5, marginBottom: 8 },
  blockBody:    { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  factRow:      { flexDirection: "row", alignItems: "center", gap: 8 },
  factSource:   { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },

  algoBlock:    { borderWidth: 3, margin: 12, marginBottom: 0, padding: 12 },
  algoFormula:  { fontSize: 10, fontFamily: "Inter_700Bold", lineHeight: 14, marginBottom: 10, letterSpacing: 0.2 },
  algoRows:     { gap: 4 },
  algoRow:      { flexDirection: "row", justifyContent: "space-between" },
  algoKey:      { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  algoVal:      { fontSize: 12, fontFamily: "Inter_700Bold" },

  refRow:       { flexDirection: "row", alignItems: "center", borderWidth: 2, padding: 10, marginBottom: 6, gap: 8 },
  refTitle:     { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  refSource:    { fontSize: 10, fontFamily: "Inter_400Regular" },
});
