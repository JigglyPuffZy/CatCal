import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Cat, ChevronRight, Plus } from "lucide-react-native";
import {
  Avatar,
  GlassCard,
  HelpBanner,
  HowItWorksCard,
  PageIntro,
  PrimaryButton,
  ScreenContainer,
} from "../components";
import { useCatFeeding } from "../context/CatFeedingContext";
import { getCatAgeLabel } from "../lib/nutrition";
import { getRouteParam } from "../lib/routeParams";
import { useTheme } from "../theme/ThemeProvider";

export function CatsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { cats, activeCatId, setActiveCatId, getPlan } = useCatFeeding();

  return (
    <ScreenContainer>
      <PageIntro
        title="My cats"
        subtitle="Tap a cat to open their profile — calories, portions, history, and meal logging."
      />

      {cats.length === 0 ? (
        <>
          <GlassCard padding="lg" className="mb-5" contentClassName="items-center">
            <View
              className="mb-4 h-16 w-16 items-center justify-center rounded-3xl"
              style={{ backgroundColor: `${colors.primary}20` }}
            >
              <Cat size={32} color={colors.primary} />
            </View>
            <Text style={{ marginBottom: 8, color: colors.text, fontSize: 20, fontWeight: "600" }}>
              No cats yet
            </Text>
            <Text
              style={{
                marginBottom: 24,
                textAlign: "center",
                color: colors.secondaryText,
                fontSize: 15,
                lineHeight: 22,
              }}
            >
              Add your first cat in about 2 minutes. We&apos;ll set up a QR code and
              daily feeding plan for you.
            </Text>
            <PrimaryButton
              label="Add my first cat"
              onPress={() => router.push("/cat/add")}
            />
          </GlassCard>
          <HowItWorksCard
            title="What happens next"
            steps={[
              {
                icon: Cat,
                title: "Tell us about your cat",
                description: "Name, weight, food brand — takes ~2 minutes.",
              },
              {
                icon: Plus,
                title: "Get QR + meal plan",
                description: "We calculate daily calories and portion sizes.",
              },
              {
                icon: ChevronRight,
                title: "Start logging meals",
                description: "Tap “I fed my cat” on the Home tab after each meal.",
              },
            ]}
          />
        </>
      ) : (
        <>
          <HelpBanner icon={Cat} title="Tip" className="mb-5">
            The cat marked Active is the one shown on your Home screen. Tap any cat
            to view their full profile.
          </HelpBanner>

          <Text
            style={{
              marginBottom: 12,
              color: colors.secondaryText,
              fontSize: 12,
              fontWeight: "600",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            Your cats
          </Text>
          <GlassCard padding="none" className="mb-4">
            {cats.map((cat, index) => {
              const plan = getPlan(cat.id);
              const isActive = cat.id === activeCatId;
              const kcalLabel = plan ? `${plan.dailyKcal} kcal/day` : "Plan unavailable";
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    setActiveCatId(cat.id);
                    router.push(`/cat/${cat.id}`);
                  }}
                  className="flex-row items-center px-4 py-4 active:opacity-80"
                  style={
                    index < cats.length - 1
                      ? { borderBottomWidth: 1, borderBottomColor: colors.border }
                      : undefined
                  }
                >
                  <Avatar name={cat.name} uri={cat.photoUri} size="md" />
                  <View className="ml-3 min-w-0 flex-1 shrink">
                    <Text
                      style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {cat.name}
                    </Text>
                    <Text
                      style={{ color: colors.secondaryText, fontSize: 13 }}
                      numberOfLines={1}
                    >
                      {getCatAgeLabel(cat.birthDate)} · {kcalLabel}
                    </Text>
                  </View>
                  {isActive ? (
                    <View
                      className="ml-2 shrink-0 rounded-full px-2.5 py-1"
                      style={{ backgroundColor: `${colors.primary}22` }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700" }}>
                        Active
                      </Text>
                    </View>
                  ) : null}
                  <ChevronRight
                    size={18}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8, flexShrink: 0 }}
                  />
                </Pressable>
              );
            })}
          </GlassCard>

          <Pressable
            onPress={() => router.push("/cat/add")}
            className="active:opacity-90"
          >
            <GlassCard padding="md">
              <View className="flex-row items-center">
                <View
                  className="mr-4 h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${colors.primary}20` }}
                >
                  <Plus size={24} color={colors.primary} />
                </View>
                <View className="min-w-0 flex-1 shrink pr-2">
                  <Text
                    style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}
                    numberOfLines={1}
                  >
                    Add another cat
                  </Text>
                  <Text
                    style={{ color: colors.secondaryText, fontSize: 13, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    Same quick setup — QR code and plan included
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.secondaryText} style={{ flexShrink: 0 }} />
              </View>
            </GlassCard>
          </Pressable>
        </>
      )}
    </ScreenContainer>
  );
}
