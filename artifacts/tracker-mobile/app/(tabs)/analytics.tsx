import React, { useMemo } from "react";
import {
  View, Text, ScrollView, StyleSheet, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useListActions,
  useListRetributionActions,
  useListSupremeCourtCases,
  getListRetributionActionsQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { calcAASI, calcRIS, CATEGORY_WEIGHTS, CONN_WEIGHTS } from "@/constants/algorithms";

const WEB_TOP = Platform.OS === "web" ? 67 : 0;

function BigStat({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[bigStatStyles.box, { backgroundColor: color, borderColor: color }]}>
      <Text style={bigStatStyles.label}>{label}</Text>
      <Text style={bigStatStyles.value}>{value}</Text>
      {sub && <Text style={bigStatStyles.sub}>{sub}</Text>}
    </View>
  );
}

const bigStatStyles = StyleSheet.create({
  box:   { flex: 1, padding: 14, borderWidth: 4, minHeight: 90 },
  label: { fontSize: 9,  fontFamily: "Inter_700Bold" as const, color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 38, fontFamily: "Inter_700Bold" as const, color: "#FFD700", lineHeight: 38 },
  sub:   { fontSize: 9,  fontFamily: "Inter_400Regular" as const, color: "rgba(255,255,255,0.6)", marginTop: 2 },
});

function FormulaBox({ formula, note }: { formula: string; note: string }) {
  const colors = useColors();
  return (
    <View style={[formulaStyles.box, { backgroundColor: colors.muted, borderColor: colors.border }]}>
      <Text style={[formulaStyles.formula, { color: colors.destructive }]}>{formula}</Text>
      <Text style={[formulaStyles.note, { color: colors.mutedForeground }]}>{note}</Text>
    </View>
  );
}

const formulaStyles = StyleSheet.create({
  box:     { borderWidth: 3, padding: 12, marginBottom: 8 },
  formula: { fontSize: 11, fontFamily: "Inter_700Bold" as const, letterSpacing: 0.3, marginBottom: 4 },
  note:    { fontSize: 10, fontFamily: "Inter_400Regular" as const, lineHeight: 14 },
});

export default function AnalyticsScreen() {
  const colors = useColors();
  const { data: adminActions, isLoading: l1 } = useListActions({});
  const { data: retActions, isLoading: l2 }   = useListRetributionActions(
    {},
    { query: { queryKey: getListRetributionActionsQueryKey({}) } }
  );
  const { data: scotusCases } = useListSupremeCourtCases({});

  const loading = l1 || l2;

  const computed = useMemo(() => {
    if (!adminActions || !retActions) return null;
    const aa = adminActions as any[];
    const ra = retActions as any[];

    const aasiScores = aa.map((a) => ({
      id: a.id, title: a.title, status: a.status, category: a.category,
      score: calcAASI({ category: a.category, status: a.status, supremeCourtChallenged: a.supremeCourtChallenged, factualityRating: a.factualityRating, date: a.date }),
    })).sort((x, y) => y.score - x.score);

    const risScores = ra.map((r) => ({
      id: r.id, title: r.title, target: r.target,
      score: calcRIS({ connectionType: r.connectionType, relationshipYears: r.relationshipYears, outcome: r.outcome, judicialResponse: r.judicialResponse }),
    })).sort((x, y) => y.score - x.score);

    const avgAASI = Math.round(aasiScores.reduce((s, a) => s + a.score, 0) / Math.max(1, aasiScores.length));
    const avgRIS  = Math.round(risScores.reduce((s, r) => s + r.score, 0) / Math.max(1, risScores.length));

    const courtBlocked = aa.filter((a) => a.status === "blocked" || a.status === "reversed").length;
    const crr = Math.round((courtBlocked / Math.max(1, aa.length)) * 100);
    const pag = Math.round((ra.length / (courtBlocked + 1)) * 10) / 10;

    return { aasiScores, risScores, avgAASI, avgRIS, crr, pag, courtBlocked, totalActions: aa.length, totalRetribution: ra.length };
  }, [adminActions, retActions]);

  const S = makeStyles(colors);

  if (loading || !computed) {
    return (
      <View style={[S.root, { justifyContent: "center", alignItems: "center", paddingTop: WEB_TOP }]}>
        <ActivityIndicator color={colors.destructive} size="large" />
        <Text style={[S.loadTxt, { color: colors.mutedForeground }]}>COMPUTING ALGORITHMS…</Text>
      </View>
    );
  }

  const { aasiScores, risScores, avgAASI, avgRIS, crr, pag, courtBlocked, totalActions } = computed;

  return (
    <ScrollView style={[S.root, { paddingTop: WEB_TOP }]} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Hero */}
      <View style={[S.hero, { backgroundColor: colors.secondary }]}>
        <Text style={[S.heroTitle, { color: colors.primary }]}>DATA ANALYTICS</Text>
        <Text style={[S.heroSub, { color: "rgba(255,255,255,0.5)" }]}>
          ALGORITHMS SCORING {totalActions} ACTIONS + {computed.totalRetribution} RETRIBUTION TARGETS
        </Text>
      </View>

      {/* 4 big stats */}
      <View style={S.statsGrid}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <BigStat label="AVG AASI SCORE"   value={avgAASI} sub="/ 100 max"         color={colors.red} />
          <BigStat label="AVG RIS SCORE"    value={avgRIS}  sub="/ 100 max"         color="#7C3AED" />
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <BigStat label="COURT RESISTANCE" value={`${crr}%`} sub={`${courtBlocked} blocked`} color={colors.blue} />
          <BigStat label="ACCOUNTABILITY GAP" value={`${pag}×`} sub="retribution / court checks" color={colors.orange} />
        </View>
      </View>

      {/* Algorithms section */}
      <View style={S.section}>
        <Text style={[S.sectionTitle, { color: colors.foreground }]}>ALGORITHM FORMULAS</Text>

        <FormulaBox
          formula="AASI = (cat_w×30) + (status×30) + (court×20) + (factuality×10) + (recency×10)"
          note="immigration=1.0 · executive_order=0.9 · tariff=0.8 | enacted=1.0 · blocked=0.35 · reversed=0.1"
        />
        <FormulaBox
          formula="RIS = (years_factor×30) + (conn_weight×35) + (outcome_sev×25) + (judicial×10)"
          note="investigator=1.0 · legal_adversary=0.9 · appointed=0.85 (betrayal factor)"
        />
        <FormulaBox
          formula="CRR = (blocked + reversed) / total_in_category × 100"
          note="Court Resistance Ratio: higher = courts more likely to push back on that category"
        />
        <FormulaBox
          formula="PAG = retribution_count / (court_blocked + reversed + 1)"
          note={"Presidential Accountability Gap: " + pag + "× · " + (pag > 3 ? "far exceeds judicial accountability" : pag > 1.5 ? "moderately elevated" : "within normal range")}
        />
      </View>

      {/* Top AASI rankings */}
      <View style={S.section}>
        <Text style={[S.sectionTitle, { color: colors.foreground }]}>TOP 10 SEVERITY SCORES (AASI)</Text>
        {aasiScores.slice(0, 10).map((a, i) => (
          <View key={a.id} style={[S.rankRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <View style={[S.rankNum, { backgroundColor: i < 3 ? colors.red : colors.secondary }]}>
              <Text style={S.rankNumTxt}>{i + 1}</Text>
            </View>
            <Text style={[S.rankTitle, { color: colors.foreground }]} numberOfLines={2}>{a.title}</Text>
            <View style={[S.rankScore, { borderColor: a.score >= 80 ? colors.red : colors.border }]}>
              <Text style={[S.rankScoreTxt, { color: a.score >= 80 ? colors.red : colors.foreground }]}>{a.score}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Top RIS rankings */}
      <View style={S.section}>
        <Text style={[S.sectionTitle, { color: colors.foreground }]}>TOP 10 RETRIBUTION INTENSITY (RIS)</Text>
        {risScores.slice(0, 10).map((r, i) => (
          <View key={r.id} style={[S.rankRow, { borderColor: "#7C3AED", backgroundColor: colors.card }]}>
            <View style={[S.rankNum, { backgroundColor: i < 3 ? "#7C3AED" : colors.secondary }]}>
              <Text style={S.rankNumTxt}>{i + 1}</Text>
            </View>
            <Text style={[S.rankTitle, { color: colors.foreground }]} numberOfLines={2}>
              {r.title.replace(/^[^—]*—\s*/, "")} — <Text style={{ color: "#7C3AED" }}>{r.target?.split("(")[0]?.trim()}</Text>
            </Text>
            <View style={[S.rankScore, { borderColor: r.score >= 70 ? "#7C3AED" : colors.border }]}>
              <Text style={[S.rankScoreTxt, { color: r.score >= 70 ? "#7C3AED" : colors.foreground }]}>{r.score}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: colors.background },
  loadTxt:       { marginTop: 12, fontFamily: "Inter_700Bold", fontSize: 12, letterSpacing: 2 },

  hero:          { padding: 16, paddingBottom: 12 },
  heroTitle:     { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  heroSub:       { fontSize: 9, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5, marginTop: 4 },

  statsGrid:     { padding: 12 },

  section:       { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 4 },
  sectionTitle:  { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 2, borderBottomWidth: 3, borderBottomColor: "#1A1A1A", paddingBottom: 6, marginBottom: 10 },

  rankRow:       { flexDirection: "row", alignItems: "center", borderWidth: 2, marginBottom: 6, overflow: "hidden" },
  rankNum:       { width: 32, alignSelf: "stretch", justifyContent: "center", alignItems: "center", padding: 6 },
  rankNumTxt:    { color: "#FFFFFF", fontSize: 12, fontFamily: "Inter_700Bold" as const },
  rankTitle:     { flex: 1, fontSize: 12, fontFamily: "Inter_600SemiBold", padding: 8, lineHeight: 15 },
  rankScore:     { borderLeftWidth: 2, padding: 8, minWidth: 36, alignItems: "center" },
  rankScoreTxt:  { fontSize: 14, fontFamily: "Inter_700Bold" as const },
});
